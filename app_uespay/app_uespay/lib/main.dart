import 'package:flutter/material.dart';
import 'package:app_uespay/telas/tela_inicial.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:app_uespay/telas/tela_sucesso_pag.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: const MyHomePage(title: 'Uespay'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => MyHomePageState();
}

class MyHomePageState extends State<MyHomePage> {
  Color corDoBotao = Colors.blue;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color.fromARGB(255, 5, 42, 166),
        title: Center(
          child: Row(
            children: [
              Padding(
                padding: EdgeInsetsGeometry.symmetric(
                  vertical: 1,
                  horizontal: 10,
                ),
                child: Image.asset(
                  'lib/assets/images/logo_uespi.png',
                  height: 40,
                ),
              ),
              Padding(
                padding: EdgeInsetsGeometry.symmetric(
                  vertical: 1,
                  horizontal: 100,
                ),
                child: Text(
                  widget.title,
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ], // centerTitle: true,
          ),
        ),
      ),
      body: Center(
        child: Column(
          children: [
            Padding(
              padding: EdgeInsetsGeometry.only(top: 80, bottom: 20),
              child: Text(
                'Scanner de Pagamento',
                style: TextStyle(
                  color: Color(0xFF3362FF),
                  fontWeight: FontWeight.bold,
                  fontSize: 30,
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(vertical: 2, horizontal: 15),
              child: Text(
                'Posicione o código QR dentro do quadrado para realizar sua transferência.',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
              ),
            ),
            Expanded(
               flex: 1,
               child: Container(
                margin: EdgeInsets.symmetric(vertical: 25, horizontal: 10),
                 height: 90,
                 width: 500,
               padding: EdgeInsets.symmetric(vertical: 20, horizontal: 20),
                 color: Color(0xFF2A2D39),
                 child:PagamentoScannerPage()               ),
             ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFF1047E0),
                fixedSize: const Size(290, 20),
              ),
              onPressed: () {
                setState(() {
                  corDoBotao = Color(0xFF020C27);
                });

                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => TelaInicial()),
                );
              },
              child: Text(
                'Acessar minha conta',
                style: TextStyle(color: Colors.white, fontSize: 15),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PagamentoScannerPage extends StatefulWidget {
  const PagamentoScannerPage({super.key});
  @override
  PagamentoScannerPageState createState() => PagamentoScannerPageState();
}

class PagamentoScannerPageState extends State<PagamentoScannerPage> {
  final MobileScannerController controller = MobileScannerController();
  bool _processandoPagamento = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: (barcodeCapture) async {
              // Evita múltiplas leituras enquanto processa
              if (_processandoPagamento) return;

              final List<Barcode> barcodes = barcodeCapture.barcodes;
              if (barcodes.isNotEmpty) {
                final String? qrData = barcodes.first.rawValue;

                if (qrData != null) {
                  setState(() {
                    _processandoPagamento = true;
                  });

                  // Pausa a câmera para não ler o mesmo código várias vezes
                  await controller.stop();

                  // Executa a validação do pagamento com os dados lidos
                  await _verificarPagamento(qrData);
                }
              }
            },
          ),
          if (_processandoPagamento)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }

  Future<void> _verificarPagamento(String dadosQrCode) async {
    String tipoStr = "Desconhecido";
    double valorNum = 0.0;
    
    try {
      final jsonQR = json.decode(dadosQrCode);
      tipoStr = jsonQR['tipo'] ?? "PAGAMENTO";
      valorNum = (jsonQR['valor'] ?? 0).toDouble();
    } catch (e) {
      if (!mounted) return;
      await showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('QR Code Inválido'),
          content: const Text('Este QR Code não é reconhecido pelo UesPay.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Voltar'),
            )
          ],
        )
      );
      setState(() => _processandoPagamento = false);
      controller.start();
      return;
    }

    final senhaController = TextEditingController();

    if (!mounted) return;
    bool? confirmou = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: Text('Pagar $tipoStr'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Valor: R\$ ${valorNum.toStringAsFixed(2)}', 
                 style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            const Text('Digite sua senha para confirmar:'),
            TextField(
              controller: senhaController,
              obscureText: true,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                hintText: 'Senha',
                prefixIcon: Icon(Icons.lock),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar', style: TextStyle(color: Colors.red)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Confirmar Pagamento'),
          ),
        ],
      ),
    );

    if (confirmou != true) {
      setState(() => _processandoPagamento = false);
      controller.start();
      return;
    }

    final senha = senhaController.text;
    
    try {
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => const Center(child: CircularProgressIndicator()),
        );
      }

      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/api/transacoes/processar-qrcode'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          "qrCodeData": dadosQrCode, 
          "userId": "1",
          "senha": senha
        }),
      );

      if (mounted) Navigator.pop(context); // Fecha loading

      if (response.statusCode == 200) {
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TelaSucessoPag(valor: valorNum),
            ),
          ).then((_) {
            // Reinicia o scanner quando voltar da tela de sucesso
            if (mounted) {
              setState(() {
                _processandoPagamento = false;
              });
              controller.start();
            }
          });
        }
      } else {
        final data = json.decode(response.body);
        _mostrarErro(data['erro'] ?? 'Verifique sua senha e saldo.');
      }

    } catch (e) {
      if (mounted) Navigator.pop(context); 
      _mostrarErro('Erro de conexão ao verificar o pagamento.');
    }
  }

  void _mostrarErro(String mensagem) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(mensagem), backgroundColor: Colors.red),
    );
    // Reinicia o scanner para o usuário tentar novamente
    setState(() {
      _processandoPagamento = false;
    });
    controller.start();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
