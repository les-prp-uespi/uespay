import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:app_uespay/telas/tela_historico_transfer.dart';
import 'package:app_uespay/telas/tela_transferir_qrcode.dart';

class TelaInicial extends StatefulWidget {
  const TelaInicial({super.key});

  @override
  State<TelaInicial> createState() => _TelaInicialState();
}

class _TelaInicialState extends State<TelaInicial> {
  String nomeUsuario = 'Aluno';
  double saldo = 0.0;
  List<dynamic> transacoesRecentes = [];
  bool carregando = true;

  @override
  void initState() {
    super.initState();
    carregarDados();
  }

  Future<void> carregarDados() async {
    setState(() {
      carregando = true;
    });

    try {
      // Buscar Usuario
      final resUser = await http.get(
        Uri.parse('http://10.0.2.2:3000/api/usuarios/1'),
      );
      if (resUser.statusCode == 200) {
        final dataUser = json.decode(resUser.body);
        nomeUsuario = dataUser['nome'] ?? 'Aluno';
      }

      // Buscar Saldo
      final resSaldo = await http.get(
        Uri.parse('http://10.0.2.2:3000/api/saldo/1/saldo'),
      );
      if (resSaldo.statusCode == 200) {
        final dataSaldo = json.decode(resSaldo.body);
        saldo = (dataSaldo['saldo'] ?? 0).toDouble();
      }

      // Buscar Historico
      final resHist = await http.get(
        Uri.parse('http://10.0.2.2:3000/api/transacoes/1/historico'),
      );
      if (resHist.statusCode == 200) {
        final dataHist = json.decode(resHist.body);
        List<dynamic> lista = dataHist['historico'] ?? [];
        
        // Pega as 3 mais recentes assumindo que as ultimas ficam no final do array no mock
        transacoesRecentes = lista.reversed.take(3).toList();
      }
    } catch (e) {
      debugPrint('Erro na tela inicial: $e');
    }

    if (mounted) {
      setState(() {
        carregando = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),

      appBar: AppBar(
        title: Text(
          'Olá, $nomeUsuario!',
          style: const TextStyle(color: Colors.black),
        ),
        backgroundColor: const Color.fromARGB(255, 227, 228, 232),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.black),
            onPressed: carregarDados,
          )
        ],
      ),

      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: carregando 
            ? const Center(child: CircularProgressIndicator())
            : Column(
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
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Saldo disponível',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 18,
                        ),
                      ),
                      Text(
                        'R\$ ${saldo.toStringAsFixed(2)}',
                        style: const TextStyle(
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
                  // BOTÃO PAGAR QR CODE
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
                            builder: (context) => const TelaTransferirQrcode(),
                          ),
                        ).then((_) => carregarDados()); // Recarrega ao voltar
                      },
                      child: const ConteudoCard(
                        'Pagar com QR Code',
                        Icons.qr_code_scanner,
                      ),
                    ),
                  ),

                  const SizedBox(width: 20),

                  // BOTÃO HISTÓRICO
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
                            builder: (context) => const TelaHistoricoTransfer(),
                          ),
                        ).then((_) => carregarDados());
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
                'Últimas transações',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 20),

              // LISTA REAL
              Expanded(
                child: transacoesRecentes.isEmpty
                    ? const Center(child: Text('Nenhuma transação recente'))
                    : ListView.builder(
                        itemCount: transacoesRecentes.length,
                        itemBuilder: (context, index) {
                          final t = transacoesRecentes[index];
                          double valor = (t['valor'] ?? 0).toDouble();
                          String titulo = t['tipo'] == 'RECARGA' 
                              ? 'Recarga' 
                              : t['tipo'] == 'REFEICAO' 
                                ? 'Pagamento RU' 
                                : 'Transferência';
                                
                          String sinal = t['tipo'] == 'RECARGA' ? '+' : '-';
                          
                          return CardHistorico(
                            titulo: titulo,
                            valor: '$sinal R\$ ${valor.toStringAsFixed(2)}',
                          );
                        },
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
            fontSize: 16,
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
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: valor.startsWith('-') ? Colors.red : Colors.green,
          ),
        ),
      ),
    );
  }
}