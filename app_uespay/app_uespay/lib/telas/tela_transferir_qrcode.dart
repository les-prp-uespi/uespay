import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:app_uespay/telas/tela_sucesso_pag.dart';

class TelaTransferirQrcode extends StatefulWidget {
  const TelaTransferirQrcode({super.key});

  @override
  TelaTransferirQrcodeState createState() => TelaTransferirQrcodeState();
}

class TelaTransferirQrcodeState extends State<TelaTransferirQrcode> {
  final MobileScannerController scannerController = MobileScannerController();
  bool _processando = false;

  @override
  void dispose() {
    scannerController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) async {
    if (_processando) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? qrData = barcodes.first.rawValue;
    if (qrData == null) return;

    setState(() => _processando = true);
    scannerController.stop();

    await _mostrarDialogoPagamento(qrData);
  }

  Future<void> _mostrarDialogoPagamento(String qrData) async {
    String tipoStr = "Desconhecido";
    double valorNum = 0.0;
    
    try {
      final jsonQR = json.decode(qrData);
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
      setState(() => _processando = false);
      scannerController.start();
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
      setState(() => _processando = false);
      scannerController.start();
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
          "qrCodeData": qrData, 
          "userId": "1",
          "senha": senha
        }),
      );

      if (mounted) Navigator.pop(context); // Fecha loading

      if (response.statusCode == 200) {
        if (mounted) {
          // Substitui a tela atual do scanner pela tela de sucesso
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => TelaSucessoPag(valor: valorNum),
            ),
          );
        }
      } else {
        final data = json.decode(response.body);
        if (mounted) {
          await showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Erro no Pagamento'),
              content: Text(data['erro'] ?? 'Verifique sua senha e saldo.'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('OK'),
                )
              ],
            )
          );
        }
        setState(() => _processando = false);
        scannerController.start();
      }

    } catch (e) {
      if (mounted) Navigator.pop(context); 
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro de conexão: $e')),
        );
      }
      setState(() => _processando = false);
      scannerController.start();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ler QR Code'),
        backgroundColor: const Color.fromARGB(255, 227, 228, 232),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: scannerController,
            onDetect: _onDetect,
          ),
          
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Aponte para o QR Code',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.greenAccent, width: 4),
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ],
            ),
          ),

          if (_processando)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }
}
