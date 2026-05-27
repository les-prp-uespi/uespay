import 'package:flutter/material.dart';
import 'package:app_uespay/telas/tela_saldo.dart';
import 'package:app_uespay/telas/tela_historico_transfer.dart';

class TelaInicial extends StatelessWidget {
  const TelaInicial({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),

      appBar: AppBar(
        title:Text(
          'Olá, Aluno!',
          style: TextStyle(
            color: Colors.black,
          ),
        ),

        backgroundColor: const Color.fromARGB(255, 227, 228, 232),
        elevation: 0,
      ),

      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,

            children: [
              // CARD PRINCIPAL
              Container(
                height: 220,
                width: double.infinity,

                decoration: BoxDecoration(
                  color: const Color(0xFF031B7A),

                  borderRadius: BorderRadius.circular(20),

                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 10,
                      offset: Offset(0, 5),
                    ),
                  ],
                ),

                child: const Padding(
                  padding: EdgeInsets.all(20),

                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,

                    children: [
                      Text(
                        'Saldo disponível',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 18,
                        ),
                      ),

                      Text(
                        'R\$ 1.250,00',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 30),

              // BOTÕES
              Row(
                children: [
                  // BOTÃO VER SALDO
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1047E0),

                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),

                        fixedSize: const Size(180, 180),
                      ),

                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const TelaSaldo(),
                          ),
                        );
                      },

                      child: const ConteudoCard(
                        'Ver saldo',
                        Icons.account_balance_wallet,
                      ),
                    ),
                  ),

                  const SizedBox(width: 20),

                  // BOTÃO TRANSFERÊNCIA
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1047E0),

                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),

                        fixedSize: const Size(180, 180),
                      ),

                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const TelaHistoricoTransfer(),
                          ),
                        );
                      },

                      child: const ConteudoCard(
                        'Histórico de transações',
                        Icons.history,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 30),

              // TÍTULO HISTÓRICO
              const Text(
                'Histórico de transações',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 20),

              // LISTA
              Expanded(
                child: ListView(
                  children: const [
                    CardHistorico(
                      titulo: 'Transferência recebida',
                      valor: '+ R\$ 150,00',
                    ),

                    CardHistorico(
                      titulo: 'Pagamento realizado',
                      valor: '- R\$ 80,00',
                    ),

                    CardHistorico(
                      titulo: 'Pix enviado',
                      valor: '- R\$ 35,00',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// COMPONENTE DOS BOTÕES
class ConteudoCard extends StatelessWidget {
  final String texto;
  final IconData icone;

  const ConteudoCard(
    this.texto,
    this.icone, {
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,

      children: [
        Icon(
          icone,
          color: Colors.white,
          size: 40,
        ),

        const SizedBox(height: 15),

        Text(
          texto,
          textAlign: TextAlign.center,

          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

// CARD DO HISTÓRICO
class CardHistorico extends StatelessWidget {
  final String titulo;
  final String valor;

  const CardHistorico({
    super.key,
    required this.titulo,
    required this.valor,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,

      margin: const EdgeInsets.only(bottom: 15),

      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),

      child: ListTile(
        contentPadding: const EdgeInsets.all(15),

        leading: const Icon(
          Icons.monetization_on,
          color: Color(0xFF1047E0),
        ),

        title: Text(
          titulo,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
          ),
        ),

        trailing: Text(
          valor,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}