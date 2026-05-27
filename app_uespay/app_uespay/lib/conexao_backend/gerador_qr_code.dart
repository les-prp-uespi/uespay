import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class GeradorQrCode extends StatelessWidget {
  final String receiverId;
  final String receiverName;
  final String wallet;
  final double amount;

  const GeradorQrCode({
    super.key,
    required this.receiverId,
    required this.receiverName,
    required this.wallet,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    // Dados que serão enviados no QR Code
    final Map<String, dynamic> qrData = {
      "receiverId": receiverId,
      "receiverName": receiverName,
      "wallet": wallet,
      "amount": amount,
    };

    // Converte para JSON
    final String qrCodeJson = jsonEncode(qrData);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gerador de QR Code'),
        centerTitle: true,
      ),

      body: Center(
        child: Container(
          padding: const EdgeInsets.all(20),
          margin: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: const [
              BoxShadow(
                blurRadius: 10,
                color: Colors.black12,
              ),
            ],
          ),

          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Pagamento via QR Code',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 20),

              QrImageView(
                data: qrCodeJson,
                version: QrVersions.auto,
                size: 250,

                backgroundColor: Colors.white,

                errorStateBuilder: (context, error) {
                  return const Center(
                    child: Text(
                      'Erro ao gerar QR Code',
                      textAlign: TextAlign.center,
                    ),
                  );
                },
              ),

              const SizedBox(height: 20),

              Text(
                'Recebedor: $receiverName',
                style: const TextStyle(fontSize: 18),
              ),

              const SizedBox(height: 8),

              Text(
                'Valor: R\$ ${amount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
