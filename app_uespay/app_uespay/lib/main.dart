import 'package:flutter/material.dart';
import 'package:app_uespay/telas/tela_inicial.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:app_uespay/telas/tela_sucesso_pag.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(colorScheme: .fromSeed(seedColor: Colors.deepPurple)),
      home: const MyHomePage(title: 'Uespay'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  Color corDoBotao = Colors.blue;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color.fromARGB(255, 5, 42, 166),
        title: 
        Center(
          child: Row(
            children: [
              Padding(padding: EdgeInsetsGeometry.symmetric(vertical: 1, horizontal: 10),
         child:Image.asset('lib/assets/images/logo_uespi.png', height: 40,),
          ),
Padding(padding: EdgeInsetsGeometry.symmetric(vertical: 1, horizontal: 300),
         child: Text(
          widget.title,
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
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
               
                height: 90,
                width: 500,
                margin: EdgeInsets.only(
                  top: 40,
                  bottom: 30,
                  left: 130,
                  right: 130,
                ),
                padding: EdgeInsets.only(top: 370, bottom: 50),
                color: Color(0xFF2A2D39),
              ),
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
  @override
  PagamentoScannerPageState createState() => PagamentoScannerPageState();
}

class PagamentoScannerPageState extends State<PagamentoScannerPage> {
  final MobileScannerController controller = MobileScannerController();
  bool _processandoPagamento = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escaneie o QR Code')),
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
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }

  Future<void> _verificarPagamento(String dadosQrCode) async {
    try {
      final bool pagamentoSucesso = await fakeVerificarApi(dadosQrCode);

      if (pagamentoSucesso) {
        // Pagamento feito com sucesso! Prossiga para próxima tela
      Navigator.push(
                          (context),
                          MaterialPageRoute(
                            builder: (context) =>
                                const TelaSucessoPag(),
                          ),
                        );
      } else {
        // Pagamento falhou
        _mostrarErro('Pagamento recusado ou não concluído.');
      }
    } catch (e) {
      _mostrarErro('Erro de conexão ao verificar o pagamento.');
    }
  }

  void _mostrarErro(String mensagem) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(mensagem), backgroundColor: Colors.red),
    );
    // Reinicia o scanner para o usuário tentar novamente
    setState(() {
      _processandoPagamento = false;
    });
    controller.start();
  }

  // Simulação de chamada de API ao seu banco/serviço
  Future<bool> fakeVerificarApi(String dados) async {
    await Future.delayed(const Duration(seconds: 3)); // Simula requisição
    return dados.contains("sucesso"); // Exemplo simples
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}