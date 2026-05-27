// Importar a classe gerador de qr code
// mostrar quem recebe e quem transfere e o valor
// o campo de senha para confirmar
// passar para a tela de sucesso

import 'package:flutter/material.dart';
import 'package:app_uespay/conexao_backend/gerador_qr_code.dart';

class TelaTransferirQrcode extends StatefulWidget {
  const TelaTransferirQrcode({super.key});

  @override
  TelaTransferirQrcodeState createState() => TelaTransferirQrcodeState();
}

class TelaTransferirQrcodeState extends State<TelaTransferirQrcode> {
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Tela de Transferência via QR Code')),
    );
  }
}
