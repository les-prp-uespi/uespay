import 'package:flutter/material.dart';

class TelaHistoricoTransfer extends StatelessWidget {
  const TelaHistoricoTransfer({super.key});

  @override
  Widget build(BuildContext context) {
     return  MaterialApp(
     home: Scaffold(
      appBar: AppBar(
        backgroundColor: Color.fromARGB(255, 227, 228, 232),
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pop(context); // Volta para a página anterior
          },
        ),
      ),

      body: Center(
        child: Text('Histórico'),
      ),
    )
     );
  }
}
