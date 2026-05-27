import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TelaHistoricoTransfer extends StatefulWidget {
  const TelaHistoricoTransfer({super.key});

  @override
  State<TelaHistoricoTransfer> createState() => _TelaHistoricoTransferState();
}

class _TelaHistoricoTransferState extends State<TelaHistoricoTransfer> {
  List<dynamic> transacoes = [];
  bool carregando = true;
  String erro = '';

  @override
  void initState() {
    super.initState();
    carregarHistorico();
  }

  Future<void> carregarHistorico() async {
    setState(() {
      carregando = true;
      erro = '';
    });

    try {
      final response = await http.get(
        Uri.parse('http://localhost:3000/api/transacoes/1/historico'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        List<dynamic> lista = data['historico'] ?? data['history'] ?? [];

        setState(() {
          transacoes = lista;
          carregando = false;
        });
      } else {
        setState(() {
          erro = 'Erro: ${response.statusCode}';
          carregando = false;
        });
      }
    } catch (e) {
      setState(() {
        erro = 'Erro de conexão';
        carregando = false;
      });
    }
  }

  String formatarData(String dataStr) {
    try {
      DateTime date = DateTime.parse(dataStr);
      return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dataStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 227, 228, 232),
        title: const Text('Histórico'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: carregando
          ? const Center(child: CircularProgressIndicator())
          : erro.isNotEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(erro),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: carregarHistorico,
                    child: const Text('Tentar novamente'),
                  ),
                ],
              ),
            )
          : transacoes.isEmpty
          ? const Center(child: Text('Nenhuma transação'))
          : ListView.builder(
              itemCount: transacoes.length,
              itemBuilder: (context, index) {
                final t = transacoes[index];
                double valor = (t['valor'] ?? t['amount'] ?? 0).toDouble();
                String data = t['data'] ?? t['timestamp'] ?? '';

                return Card(
                  margin: const EdgeInsets.all(12),
                  child: ListTile(
                    title: Text('R\$ ${valor.toStringAsFixed(2)}'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (t['fromUserId'] != null)
                          Text('De: ${t['fromUserId']}'),
                        if (t['toUserId'] != null)
                          Text('Para: ${t['toUserId']}'),
                        Text(formatarData(data)),
                      ],
                    ),
                    leading: Icon(
                      t['tipo'] == 'REFEICAO'
                          ? Icons.restaurant
                          : t['tipo'] == 'TRANSFERENCIA'
                          ? Icons.swap_horiz
                          : Icons.payment,
                    ),
                  ),
                );
              },
            ),
    );
  }
}
