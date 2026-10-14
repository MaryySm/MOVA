import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

String? movaPairingCode(String value) {
  if (RegExp(r'^\d{6}$').hasMatch(value)) return value;
  final uri = Uri.tryParse(value);
  if (uri?.scheme != 'mova' || uri?.host != 'pair') return null;
  final code = uri?.queryParameters['code'];
  return code != null && RegExp(r'^\d{6}$').hasMatch(code) ? code : null;
}

class PairingScanner extends StatefulWidget {
  const PairingScanner({super.key});
  @override
  State<PairingScanner> createState() => _PairingScannerState();
}

class _PairingScannerState extends State<PairingScanner> {
  bool _finished = false;
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
            title: const Text('Escanear reloj'),
            backgroundColor: const Color(0xfff5f0ff)),
        body: Column(children: [
          const Padding(
              padding: EdgeInsets.all(16),
              child: Text('Apunta la cámara al QR que muestra tu reloj MOVA.')),
          Expanded(
              child: MobileScanner(
            onDetect: (capture) {
              if (_finished) return;
              for (final barcode in capture.barcodes) {
                final code = movaPairingCode(barcode.rawValue ?? '');
                if (code != null) {
                  _finished = true;
                  Navigator.pop(context, code);
                  return;
                }
              }
            },
            errorBuilder: (context, error) => Center(
                child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      const Text(
                          'No se pudo abrir la cámara. Puedes permitir el acceso en Ajustes o ingresar el código manualmente.',
                          textAlign: TextAlign.center),
                      TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Ingresar código manualmente')),
                    ]))),
          )),
        ]),
      );
}

class PairingCodeDialog extends StatefulWidget {
  const PairingCodeDialog({super.key});
  @override
  State<PairingCodeDialog> createState() => _PairingCodeDialogState();
}

class _PairingCodeDialogState extends State<PairingCodeDialog> {
  final _code = TextEditingController();
  String? _error;
  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
        title: const Text('Vincular reloj'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text(
              'Escanea el QR del reloj o ingresa su código de seis dígitos. Vence en 10 minutos.'),
          const SizedBox(height: 16),
          TextField(
              controller: _code,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(6)
              ],
              maxLength: 6,
              decoration: InputDecoration(
                  labelText: 'Código del reloj',
                  hintText: '000000',
                  errorText: _error)),
          TextButton.icon(
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text('Escanear QR'),
              onPressed: () async {
                final scanned = await Navigator.of(context).push<String>(
                    MaterialPageRoute(builder: (_) => const PairingScanner()));
                if (scanned != null && mounted)
                  setState(() {
                    _code.text = scanned;
                    _error = null;
                  });
              }),
        ]),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar')),
          TextButton(
              onPressed: () {
                if (RegExp(r'^\d{6}$').hasMatch(_code.text)) {
                  Navigator.pop(context, _code.text);
                } else {
                  setState(() => _error = 'Ingresa los seis dígitos del reloj');
                }
              },
              child: const Text('Vincular'))
        ],
      );
}
