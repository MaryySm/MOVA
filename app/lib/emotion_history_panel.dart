import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class EmotionHistoryPanel extends StatefulWidget {
  const EmotionHistoryPanel({super.key, required this.apiUrl, required this.deviceId});
  final String apiUrl;
  final String deviceId;
  @override
  State<EmotionHistoryPanel> createState() => _EmotionHistoryPanelState();
}

class _EmotionHistoryPanelState extends State<EmotionHistoryPanel> {
  final _client = http.Client();
  Timer? _timer;
  bool _loading = false;
  bool _loadedOlder = false;
  String? _error;
  String? _nextCursor;
  String _period = 'day';
  Map<String, dynamic>? _report;
  List<Map<String, dynamic>> _entries = [];

  @override
  void initState() {
    super.initState();
    unawaited(_refresh());
    _timer = Timer.periodic(const Duration(seconds: 3), (_) => unawaited(_refresh()));
  }
  @override
  void dispose() {
    _timer?.cancel();
    _client.close();
    super.dispose();
  }
  Future<void> _refresh({bool older = false}) async {
    if (_loading || !mounted || (older && _nextCursor == null)) return;
    setState(() => _loading = true);
    try {
      final base = widget.apiUrl.replaceFirst(RegExp(r'/$'), '');
      var url = Uri.parse('$base/api/devices/${Uri.encodeComponent(widget.deviceId)}/emotions');
      if (older) url = url.replace(queryParameters: {'before': _nextCursor!});
      final response = await _client.get(url).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) throw Exception('API ${response.statusCode}');
      final report = jsonDecode(response.body) as Map<String, dynamic>;
      final entries = (report['entries'] as List).cast<Map<String, dynamic>>();
      if (!mounted) return;
      setState(() {
        final merged = {for (final entry in _entries) entry['id'] as String: entry};
        for (final entry in entries) { merged[entry['id'] as String] = entry; }
        _entries = merged.values.toList()..sort((a, b) {
          final time = DateTime.parse(b['recordedAt']).compareTo(DateTime.parse(a['recordedAt']));
          return time != 0 ? time : BigInt.parse(b['id']).compareTo(BigInt.parse(a['id']));
        });
        _report = report;
        if (older || !_loadedOlder) _nextCursor = report['nextCursor'] as String?;
        if (older) _loadedOlder = true;
        _error = null;
      });
    } catch (_) {
      if (mounted) setState(() => _error = 'No se pudo actualizar el historial. Reintentando…');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _date(String value) {
    final instant = DateTime.parse(value).toLocal();
    String two(int n) => n.toString().padLeft(2, '0');
    return '${two(instant.day)}/${two(instant.month)}/${instant.year} ${two(instant.hour)}:${two(instant.minute)}:${two(instant.second)}';
  }
  String _followup(Map<String, dynamic> entry) {
    if (entry['answeredAt'] != null) {
      return '${entry['stillFeeling'] == true ? 'Continúa' : 'Cambió'} · ${entry['answeredAtLocal'] ?? _date(entry['answeredAt'])}';
    }
    if (entry['supersededAt'] != null) return 'Seguimiento reemplazado por un nuevo registro';
    if (entry['dueAt'] == null) return 'Registro anterior · sin seguimiento';
    if (entry['askedAt'] != null) return 'Pregunta enviada · sin respuesta todavía';
    return 'Seguimiento programado en el reloj';
  }
  @override
  Widget build(BuildContext context) {
    final summary = _report?['summary'] as Map<String, dynamic>?;
    final period = summary?[_period] as Map<String, dynamic>?;
    final emotions = (period?['emotions'] as List? ?? []).cast<Map<String, dynamic>>();
    final total = period?['total'] ?? 0;
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const Text('Distribución de emociones', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
      const SizedBox(height: 10),
      Wrap(spacing: 8, children: [
        for (final item in const {'day': 'Hoy', 'week': 'Semana', 'month': 'Mes'}.entries)
          ChoiceChip(label: Text(item.value), selected: _period == item.key,
            onSelected: (_) => setState(() => _period = item.key)),
      ]),
      const SizedBox(height: 8),
      Text('$total registros · ${_period == 'day' ? 'día actual' : _period == 'week' ? 'semana actual, desde el lunes' : 'mes actual'} · hora de Chile', style: const TextStyle(fontSize: 12, color: Color(0xff68677e))),
      const Text('Porcentaje de registros; no representa tiempo en cada emoción.', style: TextStyle(fontSize: 11, color: Color(0xff68677e))),
      if (_error != null) Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: Text(_error!, style: const TextStyle(color: Colors.red))),
      if (_report == null && _loading) const LinearProgressIndicator(),
      if (_report != null && total == 0) const Padding(padding: EdgeInsets.all(12), child: Text('Aún no hay emociones registradas en este periodo.')),
      for (final emotion in emotions) Padding(padding: const EdgeInsets.only(top: 12), child: Column(children: [
        Row(children: [Expanded(child: Text(emotion['mood'])), Text('${emotion['percentage']}% · ${emotion['count']} registros')]),
        const SizedBox(height: 5),
        LinearProgressIndicator(value: (emotion['percentage'] as num).toDouble() / 100, color: const Color(0xfff5795a), minHeight: 7, borderRadius: BorderRadius.circular(8)),
      ])),
      const SizedBox(height: 24),
      const Text('Historial con fecha y hora', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
      const Text('Registros del teléfono y del reloj · más recientes primero', style: TextStyle(fontSize: 11, color: Color(0xff68677e))),
      if (_report != null && _entries.isEmpty) const Padding(padding: EdgeInsets.all(12), child: Text('Todavía no hay registros.')),
      for (final entry in _entries) Card(margin: const EdgeInsets.only(top: 8), color: Colors.white, child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(entry['mood'], style: const TextStyle(fontWeight: FontWeight.w800)),
        Text(entry['recordedAtLocal'] ?? _date(entry['recordedAt']), style: const TextStyle(fontSize: 12)),
        const SizedBox(height: 4),
        Text(_followup(entry), style: const TextStyle(fontSize: 11, color: Color(0xff68677e))),
      ]))),
      if (_nextCursor != null) TextButton(onPressed: _loading ? null : () => _refresh(older: true), child: const Text('Cargar registros anteriores')),
    ]);
  }
}
