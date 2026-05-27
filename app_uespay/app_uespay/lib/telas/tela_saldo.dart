import 'package:flutter/material.dart';

class TelaSaldo extends StatelessWidget {
  const TelaSaldo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color.fromARGB(255, 227, 228, 232),
        title: const Text('Saldo'),
      ),

      body: Padding(
        padding: const EdgeInsets.all(20),

        child: Column(
          children: [
            SizedBox(
              height: 180,
              width: double.infinity,
            ),

            SizedBox(height: 20),

            Text('Saldo atual'),

            Text('R\$ 1.250,00'),
          ],
        ),
      ),
    );
  }
}