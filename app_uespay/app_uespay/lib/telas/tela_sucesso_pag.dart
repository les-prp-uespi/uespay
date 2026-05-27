import 'package:flutter/material.dart';

class TelaSucessoPag extends StatelessWidget {
  const TelaSucessoPag({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
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
        body: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Padding(padding: EdgeInsets.symmetric(vertical: 30),
               child: Text('Pagamento realizado com sucesso!', style: TextStyle(fontSize: 30),),),

               Padding(padding: EdgeInsets.symmetric(vertical: 200),
             child: CircleAvatar(
  radius: 60.0, // Tamanho do círculo
  backgroundColor: Colors.green,
  child: Icon(
    Icons.check,
    color: Colors.white,
    size: 70.0, // Tamanho do ícone de check
  ),),
              ),
              Container(
                height: 70,
                width: 300,
              child: Card(
                child:Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                Text('Você enviou tantos reais!'),
                  ],
              ),
                )
              )
                ],
                ),)
          ),
        ),
      );
  
  }
}
