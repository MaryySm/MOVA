import 'package:flutter/material.dart';
import 'api_connection.dart';

class ConnectionDialog extends StatefulWidget {
  const ConnectionDialog({super.key});
  @override
  State<ConnectionDialog> createState() => _ConnectionDialogState();
}

class _ConnectionDialogState extends State<ConnectionDialog> {
  final _address = TextEditingController(text: ApiConnection.url);
  String? _message;
  String? _checked;
  bool _busy = false;
  @override
  void dispose() {
    _address.dispose();
    super.dispose();
  }

  Future<void> _check() async {
    setState(() {
      _busy = true;
      _message = null;
      _checked = null;
    });
    try {
      final result = await ApiConnection.check(_address.text);
      if (mounted)
        setState(() {
          _checked = result;
          _message = 'Conexión correcta · base de datos disponible';
        });
    } catch (_) {
      if (mounted)
        setState(() => _message =
            'No se pudo conectar. Comprueba que el Mac y el teléfono están en la misma Wi-Fi, Docker está activo y MOVA tiene permiso de red local.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
        title: const Text('Conexión con MOVA'),
        content: SizedBox(
            width: 320,
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const Text(
                  'Usa el nombre del Mac para evitar cambiar la dirección cada vez que cambia su IP.'),
              const SizedBox(height: 16),
              TextField(
                  controller: _address,
                  enabled: !_busy,
                  keyboardType: TextInputType.url,
                  autocorrect: false,
                  decoration: const InputDecoration(
                      labelText: 'Dirección del servidor'),
                  onChanged: (_) => setState(() {
                        _checked = null;
                        _message = null;
                      })),
              TextButton(
                  onPressed: _busy
                      ? null
                      : () {
                          _address.text = defaultMovaApiUrl;
                          setState(() {
                            _checked = null;
                            _message = null;
                          });
                        },
                  child: const Text('Usar dirección predeterminada')),
              if (_message != null)
                Text(_message!, style: const TextStyle(fontSize: 12)),
              if (_busy)
                const Padding(
                    padding: EdgeInsets.only(top: 12),
                    child: LinearProgressIndicator()),
            ])),
        actions: [
          TextButton(
              onPressed: _busy ? null : () => Navigator.pop(context),
              child: const Text('Cancelar')),
          TextButton(
              onPressed: _busy ? null : _check, child: const Text('Comprobar')),
          TextButton(
              onPressed: _busy || _checked == null
                  ? null
                  : () async {
                      setState(() => _busy = true);
                      try {
                        await ApiConnection.save(_checked!);
                        if (context.mounted) Navigator.pop(context, true);
                      } catch (_) {
                        if (mounted)
                          setState(() {
                            _busy = false;
                            _message =
                                'No se pudo guardar la dirección. Reintenta.';
                          });
                      }
                    },
              child: const Text('Guardar')),
        ],
      );
}
