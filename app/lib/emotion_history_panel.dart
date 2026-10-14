import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class EmotionHistoryPanel extends StatefulWidget {
  const EmotionHistoryPanel(
      {super.key,
      required this.apiUrl,
      required this.deviceId,
      this.profileId,
      this.token = ''});
  final String apiUrl;
  final String deviceId;
  final String? profileId;
  final String token;
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
    _timer = Timer.periodic(
        const Duration(seconds: 3), (_) => unawaited(_refresh()));
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
      var url = Uri.parse(widget.profileId == null
          ? '$base/api/devices/${Uri.encodeComponent(widget.deviceId)}/emotions'
          : '$base/api/profiles/${widget.profileId}/emotions');
      if (older) url = url.replace(queryParameters: {'before': _nextCursor!});
      final response = await _client.get(url, headers: {
        if (widget.token.isNotEmpty) 'Authorization': 'Bearer ${widget.token}'
      }).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200)
        throw Exception('API ${response.statusCode}');
      final report = jsonDecode(response.body) as Map<String, dynamic>;
      final entries = (report['entries'] as List).cast<Map<String, dynamic>>();
      if (!mounted) return;
      setState(() {
        final merged = {
          for (final entry in _entries) entry['id'] as String: entry
        };
        for (final entry in entries) {
          merged[entry['id'] as String] = entry;
        }
        _entries = merged.values.toList()
          ..sort((a, b) {
            final time = DateTime.parse(b['recordedAt'])
                .compareTo(DateTime.parse(a['recordedAt']));
            return time != 0
                ? time
                : BigInt.parse(b['id']).compareTo(BigInt.parse(a['id']));
          });
        _report = report;
        if (older || !_loadedOlder)
          _nextCursor = report['nextCursor'] as String?;
        if (older) _loadedOlder = true;
        _error = null;
      });
    } catch (_) {
      if (mounted)
        setState(
            () => _error = 'No se pudo actualizar el historial. Reintentando…');
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
    if (entry['supersededAt'] != null)
      return 'Seguimiento reemplazado por un nuevo registro';
    if (entry['dueAt'] == null) return 'Registro anterior · sin seguimiento';
    if (entry['askedAt'] != null)
      return 'Pregunta enviada · sin respuesta todavía';
    return 'Seguimiento programado en el reloj';
  }

  @override
  Widget build(BuildContext context) {
    final summary = _report?['summary'] as Map<String, dynamic>?;
    final period = summary?[_period] as Map<String, dynamic>?;
    final emotions =
        (period?['emotions'] as List? ?? []).cast<Map<String, dynamic>>();
    final total = period?['total'] ?? 0;
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const Text('Distribución de emociones',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
      const SizedBox(height: 10),
      Wrap(spacing: 8, children: [
        for (final item
            in const {'day': 'Hoy', 'week': 'Semana', 'month': 'Mes'}.entries)
          ChoiceChip(
              label: Text(item.value),
              selected: _period == item.key,
              onSelected: (_) => setState(() => _period = item.key)),
      ]),
      const SizedBox(height: 8),
      Text(
          '$total registros · ${_period == 'day' ? 'día actual' : _period == 'week' ? 'semana actual, desde el lunes' : 'mes actual'} · hora de Chile',
          style: const TextStyle(fontSize: 12, color: Color(0xff68677e))),
      const Text(
          'Porcentaje de registros; no representa tiempo en cada emoción.',
          style: TextStyle(fontSize: 11, color: Color(0xff68677e))),
      if (_error != null)
        Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text(_error!, style: const TextStyle(color: Colors.red))),
      if (_report == null && _loading) const LinearProgressIndicator(),
      if (_report != null && total == 0)
        const Padding(
            padding: EdgeInsets.all(12),
            child: Text('Aún no hay emociones registradas en este periodo.')),
      if (_report != null && total != 0)
        Padding(
            padding: const EdgeInsets.only(top: 16),
            child: EmotionBarChart(emotions: emotions)),
      const SizedBox(height: 24),
      const Text('Historial con fecha y hora',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
      const Text('Registros del teléfono y del reloj · más recientes primero',
          style: TextStyle(fontSize: 11, color: Color(0xff68677e))),
      if (_report != null && _entries.isEmpty)
        const Padding(
            padding: EdgeInsets.all(12),
            child: Text('Todavía no hay registros.')),
      for (final entry in _entries)
        Card(
            margin: const EdgeInsets.only(top: 8),
            color: Colors.white,
            child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(entry['mood'],
                          style: const TextStyle(fontWeight: FontWeight.w800)),
                      Text(
                          entry['recordedAtLocal'] ??
                              _date(entry['recordedAt']),
                          style: const TextStyle(fontSize: 12)),
                      const SizedBox(height: 4),
                      if ((entry['note'] as String? ?? '').isNotEmpty)
                        Text(entry['note']),
                      if ((entry['tags'] as List? ?? []).isNotEmpty)
                        Text((entry['tags'] as List).join(' · ')),
                      Text(_followup(entry),
                          style: const TextStyle(
                              fontSize: 11, color: Color(0xff68677e))),
                    ]))),
      if (_nextCursor != null)
        TextButton(
            onPressed: _loading ? null : () => _refresh(older: true),
            child: const Text('Cargar registros anteriores')),
    ]);
  }
}

// Stable catalog order and colors: a mood keeps its color across all periods.
class EmotionBarChart extends StatelessWidget {
  const EmotionBarChart({super.key, required this.emotions});
  final List<Map<String, dynamic>> emotions;
  static const colors = <String, Color>{
    '¡Genial!': Color(0xffa8e6cf),
    'Bien': Color(0xffb8d8f5),
    'Normal': Color(0xffd4c4f5),
    'Cansado': Color(0xffffe3a3),
    'Triste': Color(0xfff5b8c8),
    'Enojado': Color(0xffffc9ad),
    'Estresado': Color(0xffedc2e4),
  };
  @override
  Widget build(BuildContext context) => SizedBox(
      height: 225,
      child: LayoutBuilder(builder: (context, constraints) {
        final width = constraints.maxWidth < 320 ? 320.0 : constraints.maxWidth;
        return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SizedBox(
                width: width,
                child:
                    Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  SizedBox(
                      width: 28,
                      child: Column(children: [
                        const SizedBox(height: 24),
                        SizedBox(
                            height: 140,
                            child: Column(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  for (final value in [100, 75, 50, 25, 0])
                                    Text('$value',
                                        style: const TextStyle(
                                            fontSize: 9,
                                            color: Color(0xff68677e)))
                                ])),
                        const SizedBox(height: 61),
                      ])),
                  for (final mood in colors.keys)
                    Expanded(child: Builder(builder: (context) {
                      final item =
                          emotions.where((e) => e['mood'] == mood).firstOrNull;
                      final percent =
                          (item?['percentage'] as num? ?? 0).toDouble();
                      final count = item?['count'] ?? 0;
                      return Semantics(
                          label: '$mood: $percent por ciento, $count registros',
                          child: Column(children: [
                            SizedBox(
                                height: 24,
                                child: Center(
                                    child: Text(
                                        '${percent.toStringAsFixed(percent % 1 == 0 ? 0 : 1)}%',
                                        style: const TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700)))),
                            Container(
                              height: 140,
                              width: double.infinity,
                              alignment: Alignment.bottomCenter,
                              decoration: const BoxDecoration(
                                  border: Border(
                                      bottom: BorderSide(
                                          color: Color(0xffddd6e7)))),
                              child: FractionallySizedBox(
                                  widthFactor: .62,
                                  child: AnimatedContainer(
                                      duration:
                                          const Duration(milliseconds: 300),
                                      height: 140 * percent.clamp(0, 100) / 100,
                                      decoration: BoxDecoration(
                                          color: colors[mood],
                                          borderRadius:
                                              const BorderRadius.vertical(
                                                  top: Radius.circular(7))))),
                            ),
                            const SizedBox(height: 7),
                            SizedBox(
                                height: 34,
                                child: Text(mood,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                        fontSize: 9,
                                        color: Color(0xff68677e)))),
                            Text('$count',
                                style: const TextStyle(
                                    fontSize: 9, color: Color(0xff68677e))),
                          ]));
                    })),
                ])));
      }));
}
