part of 'main.dart';

const _monthNames = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];
const _dayNames = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];
String _prettyDate(DateTime date) =>
    '${_dayNames[date.weekday - 1]}, ${date.day} de ${_monthNames[date.month - 1]}';

// Reuse the original responsive phone frame for every authenticated and access screen.
class _OriginalPhoneFrame extends StatelessWidget {
  const _OriginalPhoneFrame({required this.child, required this.background});
  final Widget child;
  final Color background;
  @override
  Widget build(BuildContext context) {
    if (MediaQuery.sizeOf(context).width <= 600) return child;
    return Scaffold(
        body: Container(
            decoration: const BoxDecoration(
                gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                  Color(0xffe8e0ff),
                  Color(0xffffe8f0),
                  Color(0xffe0f5ff),
                  Color(0xffe8ffe8)
                ])),
            child: Center(
                child: Container(
                    width: 390,
                    height: MediaQuery.sizeOf(context)
                        .height
                        .clamp(600, 844)
                        .toDouble(),
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: .65),
                        borderRadius: BorderRadius.circular(56),
                        boxShadow: const [
                          BoxShadow(
                              color: Color(0x30000000),
                              blurRadius: 42,
                              offset: Offset(0, 22))
                        ]),
                    child: ClipRRect(
                        borderRadius: BorderRadius.circular(49),
                        child: child)))));
  }
}

extension _ConnectedOriginalDesign on _ConnectedDashboardState {
  Color get _accent => _sectionColors[_tab];
  double get _progress => _tasks.isEmpty
      ? 0
      : _tasks.where((t) => t['done'] == true).length / _tasks.length;
  Widget _card(Widget child) => Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: const [
            BoxShadow(
                color: Color(0x10000000), blurRadius: 12, offset: Offset(0, 3))
          ]),
      child: child);
  Widget _label(String text) => Padding(
      padding: const EdgeInsets.fromLTRB(2, 18, 2, 9),
      child: Text(text,
          style: const TextStyle(
              color: _ink, fontSize: 14, fontWeight: FontWeight.w800)));
  Widget _primary(String text, VoidCallback? action, {IconData? icon}) =>
      FilledButton(
          onPressed: action,
          style: FilledButton.styleFrom(
              backgroundColor: _accent,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15))),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            if (icon != null) ...[
              Icon(icon, size: 18),
              const SizedBox(width: 8)
            ],
            Text(text, style: const TextStyle(fontWeight: FontWeight.w800))
          ]));
  Widget _page(String title, String subtitle, List<Widget> children) =>
      ListView(padding: EdgeInsets.zero, children: [
        Container(
            padding: const EdgeInsets.fromLTRB(20, 28, 20, 18),
            decoration: BoxDecoration(
                gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                  _accent.withValues(alpha: .2),
                  _sectionBackgrounds[_tab]
                ])),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title,
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.w900, color: _ink)),
              const SizedBox(height: 3),
              Text(subtitle,
                  style: TextStyle(
                      fontSize: 13, color: _accent.withValues(alpha: .9)))
            ])),
        const SizedBox(height: 17),
        Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 22),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: children))
      ]);
  void _selectProfile(String id) {
    _updateUi(() {
      _generation++;
      _profileId = id;
      _deviceId = null;
      _state = null;
      _selectedMood = null;
      _selectedTags.clear();
      _note.clear();
      _tasks = [];
      _events = [];
      _notices = [];
      _preferences = null;
    });
    unawaited(_reload());
  }

  Widget _avatar({double size = 40}) {
    final name = _profile?['name'] as String? ?? 'MOVA';
    final photo = _profile?['photo'] as String? ?? '';
    return Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient:
                LinearGradient(colors: [_accent, const Color(0xffa882f5)])),
        child: photo.isEmpty
            ? Text(name.isEmpty ? 'M' : name[0].toUpperCase(),
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: size * .42))
            : ClipOval(
                child: Image.memory(base64Decode(photo),
                    width: size,
                    height: size,
                    fit: BoxFit.cover,
                    errorBuilder: (_, error, stack) =>
                        const Icon(Icons.person, color: Colors.white))));
  }

  Widget _originalDashboard(BuildContext context) {
    return Theme(
        data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.fromSeed(seedColor: _accent),
            inputDecorationTheme: InputDecorationTheme(
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: const BorderSide(color: Color(0x16000000))),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: const BorderSide(color: Color(0x16000000))),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: BorderSide(color: _accent)))),
        child: Scaffold(
            backgroundColor: _sectionBackgrounds[_tab],
            body: SafeArea(
                bottom: false,
                child: Column(children: [
                  if (_error != null)
                    MaterialBanner(
                        content:
                            Text(_error!, style: const TextStyle(fontSize: 12)),
                        actions: [
                          TextButton(
                              onPressed: _reload,
                              child: const Text('Reintentar'))
                        ]),
                  Expanded(
                      child: _profileId == null
                          ? _loading
                              ? const Center(child: CircularProgressIndicator())
                              : Center(
                                  child: _primary('Crear primer perfil',
                                      () => _profileForm(create: true)))
                          : AnimatedSwitcher(
                              duration: const Duration(milliseconds: 180),
                              child: switch (_tab) {
                                0 => _originalHome(),
                                1 => _originalRoutines(),
                                2 => _originalCalendar(),
                                3 => _page(
                                    'Estado emocional',
                                    '¿Cómo te encuentras hoy?',
                                    _originalEmotions()),
                                _ => _page(
                                    'Configuración',
                                    'Tu cuenta y tus dispositivos MOVA',
                                    _originalSettings())
                              }))
                ])),
            bottomNavigationBar: _originalNav()));
  }

  Widget _originalNav() => SafeArea(
      top: false,
      child: Container(
          height: 66,
          decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: .96),
              border: const Border(top: BorderSide(color: Color(0x10000000)))),
          child: Row(children: [
            for (final (index, icon, label) in const [
              (0, Icons.home_outlined, 'Inicio'),
              (1, Icons.checklist_rounded, 'Rutinas'),
              (2, Icons.calendar_month_outlined, 'Agenda'),
              (3, Icons.mood_outlined, 'Emociones'),
              (4, Icons.tune_rounded, 'Ajustes')
            ])
              Expanded(
                  child: Semantics(
                      selected: _tab == index,
                      button: true,
                      label: label,
                      child: InkWell(
                          onTap: () => _updateUi(() => _tab = index),
                          child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                if (_tab == index)
                                  Container(
                                      width: 28,
                                      height: 3,
                                      margin: const EdgeInsets.only(bottom: 5),
                                      decoration: BoxDecoration(
                                          color: _sectionColors[index],
                                          borderRadius:
                                              BorderRadius.circular(3))),
                                Icon(icon,
                                    size: 21,
                                    color: _tab == index
                                        ? _sectionColors[index]
                                        : const Color(0xffbdb8d4)),
                                const SizedBox(height: 2),
                                Text(label,
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: _tab == index
                                            ? FontWeight.w700
                                            : FontWeight.w400,
                                        color: _tab == index
                                            ? _sectionColors[index]
                                            : const Color(0xffbdb8d4)))
                              ]))))
          ])));

  Widget _originalHome() => ListView(
          key: const ValueKey('home'),
          padding: EdgeInsets.zero,
          children: [
            Container(
                padding: const EdgeInsets.fromLTRB(20, 27, 20, 18),
                decoration: const BoxDecoration(
                    gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Color(0xffffd9e8), Color(0xfffff0f5)])),
                child: Row(children: [
                  Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Text(_prettyDate(DateTime.now()),
                            style: const TextStyle(
                                color: Color(0xffb06080), fontSize: 12)),
                        const SizedBox(height: 3),
                        Text(
                            '¡Hola, ${(_profile?['name'] as String? ?? '').split(' ').first}! 👋',
                            style: const TextStyle(
                                color: _ink,
                                fontSize: 22,
                                fontWeight: FontWeight.w900))
                      ])),
                  Material(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(13),
                      child: IconButton(
                          onPressed: _originalNotifications,
                          tooltip: 'Notificaciones',
                          icon: const Icon(Icons.notifications_none_rounded,
                              color: Color(0xfff590b8)))),
                  const SizedBox(width: 9),
                  InkWell(
                      onTap: () => _updateUi(() => _tab = 4), child: _avatar())
                ])),
            Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 15),
                child: _card(Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('¿Cómo estás hoy?',
                                style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14,
                                    color: _ink)),
                            TextButton(
                                onPressed: () => _updateUi(() => _tab = 3),
                                style: TextButton.styleFrom(
                                    padding: EdgeInsets.zero,
                                    minimumSize: Size.zero,
                                    tapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap),
                                child: const Text('Ver más →',
                                    style: TextStyle(
                                        color: Color(0xfff590b8),
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700)))
                          ]),
                      const SizedBox(height: 9),
                      Row(children: [
                        for (final mood in _moods)
                          Expanded(
                              child: Semantics(
                                  button: true,
                                  label: mood.name,
                                  child: InkWell(
                                      onTap: !_canWrite
                                          ? null
                                          : () {
                                              _updateUi(() =>
                                                  _selectedMood = mood.name);
                                              unawaited(
                                                  _saveEmotion(mood.name));
                                            },
                                      borderRadius: BorderRadius.circular(12),
                                      child: Container(
                                          margin: const EdgeInsets.symmetric(
                                              horizontal: 2),
                                          padding: const EdgeInsets.symmetric(
                                              vertical: 8, horizontal: 2),
                                          decoration: BoxDecoration(
                                              color: (_selectedMood ??
                                                          _state?['payload']
                                                              ?['mood']) ==
                                                      mood.name
                                                  ? mood.color
                                                      .withValues(alpha: .13)
                                                  : Colors.transparent,
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                              border: Border.all(
                                                  color: (_selectedMood ??
                                                              _state?['payload']
                                                                  ?['mood']) ==
                                                          mood.name
                                                      ? mood.color
                                                      : Colors.transparent,
                                                  width: 1.5)),
                                          child: Column(children: [
                                            Text(mood.face,
                                                style: const TextStyle(
                                                    fontSize: 21)),
                                            const SizedBox(height: 3),
                                            Text(mood.name,
                                                style: const TextStyle(
                                                    fontSize: 9,
                                                    color: _muted,
                                                    fontWeight:
                                                        FontWeight.w700))
                                          ])))))
                      ]),
                      if (_state?['payload']?['mood'] != null)
                        Padding(
                            padding: const EdgeInsets.only(top: 9),
                            child: Text(
                                'Estado guardado: ${_state!['payload']['mood']}',
                                style: const TextStyle(
                                    fontSize: 11, color: _muted)))
                    ]))),
            Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 15),
                child: _originalDeviceCard()),
            Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Rutina del día',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: _ink)),
                      Text('${(_progress * 100).round()}% completo',
                          style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xfff590b8)))
                    ])),
            Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
                child: LinearProgressIndicator(
                    value: _progress,
                    minHeight: 6,
                    borderRadius: BorderRadius.circular(8),
                    color: _accent,
                    backgroundColor: const Color(0x18000000))),
            for (final group in ['Mañana', 'Tarde', 'Noche'])
              if (_groupTasks(group).isNotEmpty)
                Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                              padding: const EdgeInsets.only(bottom: 7),
                              child: Text(
                                  '${group == 'Mañana' ? '🌅' : group == 'Tarde' ? '☀️' : '🌙'}  $group',
                                  style: const TextStyle(
                                      color: _muted,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 11,
                                      letterSpacing: .5))),
                          ..._groupTasks(group).map(_taskTile)
                        ])),
            if (_tasks.isEmpty)
              const Padding(
                  padding: EdgeInsets.all(20),
                  child: Text('No hay tareas programadas para hoy.')),
            const SizedBox(height: 12)
          ]);
  List<dynamic> _groupTasks(String group) => _tasks.where((t) {
        final hour = int.parse(t['scheduled_time'].toString().substring(0, 2));
        return group == 'Mañana'
            ? hour < 12
            : group == 'Tarde'
                ? hour >= 12 && hour < 19
                : hour >= 19;
      }).toList();
  Widget _originalDeviceCard() => Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
          onTap: () => _updateUi(() {
                _tab = 4;
                _deviceExpanded = true;
              }),
          child: SizedBox(
              height: 112,
              child: Stack(fit: StackFit.expand, children: [
                CustomPaint(painter: _MapPainter()),
                Positioned(
                    top: 8,
                    left: 12,
                    child: Text('Dispositivo MOVA',
                        style: const TextStyle(
                            color: Color(0xff7098f5),
                            fontSize: 11,
                            fontWeight: FontWeight.w700))),
                Align(
                    alignment: Alignment.bottomCenter,
                    child: Container(
                        margin: const EdgeInsets.fromLTRB(11, 0, 11, 10),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: .94),
                            borderRadius: BorderRadius.circular(11)),
                        child: Row(children: [
                          const Icon(Icons.watch_outlined,
                              color: Color(0xff7098f5), size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                              child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                Text(_profile?['name'] ?? 'MOVA',
                                    style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                        color: _ink)),
                                Text(
                                    _deviceId == null
                                        ? 'Sin reloj vinculado'
                                        : '$_deviceId · ${_state?['payload']?['battery'] == null ? 'Sin dato de batería' : '${_state!['payload']['battery']}%'}',
                                    style: const TextStyle(
                                        fontSize: 10, color: _muted))
                              ])),
                          const Text('Ver reloj →',
                              style: TextStyle(
                                  fontSize: 11,
                                  color: Color(0xff7098f5),
                                  fontWeight: FontWeight.w700))
                        ]))),
                if (_state?['payload']?['sos'] == true)
                  Positioned(
                      top: 8,
                      right: 8,
                      child: FilledButton(
                          onPressed: !_canWrite
                              ? null
                              : () => _mutate(
                                      'PATCH',
                                      '/api/devices/${Uri.encodeComponent(_deviceId!)}/state',
                                      {
                                        'sos': false
                                      }),
                          style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xfff5795a)),
                          child: const Text('🆘 Confirmar SOS')))
              ]))));
  Widget _taskTile(dynamic task) {
    final index = _tasks.indexOf(task);
    final colors = [
      const Color(0xfff5a84b),
      const Color(0xff5bb8f5),
      const Color(0xff5ecfa8),
      const Color(0xff6b9fff),
      const Color(0xff9b72f5)
    ];
    final color = colors[(index < 0 ? 0 : index) % colors.length];
    final done = task['done'] == true;
    void complete() {
      unawaited(_mutate('PUT', '/api/tasks/${task['id']}/completion',
          {'done': !done, 'date': _taskDate}));
    }

    return Padding(
        padding: const EdgeInsets.only(bottom: 7),
        child: Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            child: InkWell(
                onTap: !_canWrite ? null : complete,
                borderRadius: BorderRadius.circular(14),
                child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 13, vertical: 10),
                    child: Row(children: [
                      Semantics(
                          checked: done,
                          label: task['title'],
                          child: Container(
                              width: 21,
                              height: 21,
                              decoration: BoxDecoration(
                                  color: done ? color : Colors.transparent,
                                  borderRadius: BorderRadius.circular(7),
                                  border: Border.all(
                                      color: done
                                          ? color
                                          : const Color(0x44000000),
                                      width: 1.7)),
                              child: done
                                  ? const Icon(Icons.check,
                                      size: 15, color: Colors.white)
                                  : null)),
                      const SizedBox(width: 12),
                      Expanded(
                          child: Text('${task['icon']}  ${task['title']}',
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: _ink,
                                  decoration: done
                                      ? TextDecoration.lineThrough
                                      : null))),
                      Text(task['scheduled_time'].toString().substring(0, 5),
                          style: const TextStyle(fontSize: 11, color: _muted)),
                      const SizedBox(width: 8),
                      if (_tab == 1 && _canWrite)
                        PopupMenuButton<String>(
                            padding: EdgeInsets.zero,
                            tooltip: 'Editar tarea',
                            icon:
                                Icon(Icons.more_horiz, color: color, size: 18),
                            onSelected: (value) => value == 'edit'
                                ? _taskForm(Map<String, dynamic>.from(task))
                                : _mutate('DELETE', '/api/tasks/${task['id']}'),
                            itemBuilder: (_) => const [
                                  PopupMenuItem(
                                      value: 'edit', child: Text('Editar')),
                                  PopupMenuItem(
                                      value: 'delete', child: Text('Archivar'))
                                ])
                    ])))));
  }

  Widget _originalRoutines() =>
      _page('Mis Rutinas', 'Pequeños hábitos, grandes cambios.', [
        _card(Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Progreso de hoy',
              style: TextStyle(color: _muted, fontSize: 12)),
          const SizedBox(height: 8),
          LinearProgressIndicator(
              value: _progress,
              color: _accent,
              backgroundColor: _accent.withValues(alpha: .13),
              minHeight: 8,
              borderRadius: BorderRadius.circular(8)),
          const SizedBox(height: 7),
          Text(
              '${_tasks.where((t) => t['done'] == true).length}/${_tasks.length} completadas',
              style: TextStyle(
                  color: _accent, fontSize: 12, fontWeight: FontWeight.w700))
        ])),
        const SizedBox(height: 12),
        if (_canWrite)
          _primary('Nueva tarea', () => _taskForm(), icon: Icons.add),
        for (final group in ['Mañana', 'Tarde', 'Noche'])
          if (_groupTasks(group).isNotEmpty) ...[
            _label(group),
            ..._groupTasks(group).map(_taskTile)
          ],
        if (_tasks.isEmpty) _label('No hay tareas programadas para hoy.')
      ]);

  Widget _originalCalendar() {
    final first = DateTime(_calendarMonth.year, _calendarMonth.month, 1);
    final count = DateTime(first.year, first.month + 1, 0).day;
    final cells = List<int?>.filled(first.weekday - 1, null, growable: true)
      ..addAll(List.generate(count, (i) => i + 1));
    while (cells.length % 7 != 0) {
      cells.add(null);
    }
    final events = _events.where((e) {
      final d = DateTime.parse(e['starts_at']).toLocal();
      return d.year == _calendarDay.year &&
          d.month == _calendarDay.month &&
          d.day == _calendarDay.day;
    }).toList();
    void month(int delta) => _updateUi(() {
          _calendarMonth = DateTime(first.year, first.month + delta, 1);
          _calendarDay = _calendarMonth;
        });
    return _page(
        '${_monthNames[first.month - 1][0].toUpperCase()}${_monthNames[first.month - 1].substring(1)} ${first.year}',
        'Organiza tu semana, a tu ritmo.', [
      _card(Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          IconButton(
              tooltip: 'Mes anterior',
              onPressed: () => month(-1),
              icon: Icon(Icons.chevron_left, color: _accent)),
          Text('${_monthNames[first.month - 1]} ${first.year}',
              style: const TextStyle(fontWeight: FontWeight.w800, color: _ink)),
          IconButton(
              tooltip: 'Mes siguiente',
              onPressed: () => month(1),
              icon: Icon(Icons.chevron_right, color: _accent))
        ]),
        Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
          for (final day in ['L', 'M', 'X', 'J', 'V', 'S', 'D'])
            SizedBox(
                width: 30,
                child: Center(
                    child: Text(day,
                        style: const TextStyle(
                            color: _muted,
                            fontWeight: FontWeight.w700,
                            fontSize: 11))))
        ]),
        const SizedBox(height: 12),
        for (var row = 0; row < cells.length; row += 7)
          Padding(
              padding: const EdgeInsets.only(bottom: 7),
              child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    for (final day in cells.skip(row).take(7))
                      SizedBox(
                          width: 34,
                          height: 34,
                          child: day == null
                              ? const SizedBox.shrink()
                              : InkWell(
                                  onTap: () => _updateUi(() => _calendarDay =
                                      DateTime(first.year, first.month, day)),
                                  borderRadius: BorderRadius.circular(18),
                                  child: Container(
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                          color: day == _calendarDay.day
                                              ? _accent
                                              : Colors.transparent,
                                          shape: BoxShape.circle),
                                      child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text('$day',
                                                style: TextStyle(
                                                    color:
                                                        day == _calendarDay.day
                                                            ? Colors.white
                                                            : _ink,
                                                    fontWeight:
                                                        day == _calendarDay.day
                                                            ? FontWeight.w800
                                                            : FontWeight.w500)),
                                            if (_events.any((e) {
                                              final d =
                                                  DateTime.parse(e['starts_at'])
                                                      .toLocal();
                                              return d.year == first.year &&
                                                  d.month == first.month &&
                                                  d.day == day;
                                            }))
                                              Container(
                                                  width: 4,
                                                  height: 4,
                                                  decoration: BoxDecoration(
                                                      color: day ==
                                                              _calendarDay.day
                                                          ? Colors.white
                                                          : _accent,
                                                      shape: BoxShape.circle))
                                          ]))))
                  ]))
      ])),
      _label(_prettyDate(_calendarDay)),
      if (_canWrite)
        _primary('Nuevo evento', () => _eventForm(), icon: Icons.add),
      const SizedBox(height: 12),
      if (events.isEmpty)
        const Text('No hay eventos para este día.',
            style: TextStyle(color: _muted, fontSize: 12)),
      for (final event in events)
        Container(
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border(left: BorderSide(color: _accent, width: 4))),
            child: ListTile(
                dense: true,
                title: Text(event['title'],
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: _ink)),
                subtitle: Text(
                    '${DateTime.parse(event['starts_at']).toLocal().toString().substring(11, 16)} · ${DateTime.parse(event['ends_at']).difference(DateTime.parse(event['starts_at'])).inMinutes} min${event['notes'] == '' ? '' : '\n${event['notes']}'}',
                    style: const TextStyle(fontSize: 11, color: _muted)),
                trailing: !_canWrite
                    ? null
                    : PopupMenuButton<String>(
                        icon: Icon(Icons.more_horiz, color: _accent),
                        onSelected: (value) => value == 'edit'
                            ? _eventForm(Map<String, dynamic>.from(event))
                            : _mutate('DELETE', '/api/calendar/${event['id']}'),
                        itemBuilder: (_) => const [
                              PopupMenuItem(
                                  value: 'edit', child: Text('Editar')),
                              PopupMenuItem(
                                  value: 'delete', child: Text('Archivar'))
                            ])))
    ]);
  }

  List<Widget> _originalEmotions() => [
        GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 3,
            crossAxisSpacing: 9,
            mainAxisSpacing: 9,
            childAspectRatio: 1.24,
            children: [
              for (final mood in _emotions) _originalEmotionChoice(mood)
            ]),
        _label('¿Qué más sientes?'),
        Wrap(spacing: 7, runSpacing: 7, children: [
          for (final tag in _tags)
            FilterChip(
                label: Text(tag['label']),
                selected: _selectedTags.contains(tag['id']),
                selectedColor: _accent.withValues(alpha: .18),
                onSelected: !_canWrite
                    ? null
                    : (value) => _updateUi(() => value
                        ? _selectedTags.add(tag['id'])
                        : _selectedTags.remove(tag['id'])))
        ]),
        _label('¿Quieres contarnos algo más?'),
        TextField(
            controller: _note,
            minLines: 3,
            maxLines: 4,
            enabled: _canWrite,
            decoration: InputDecoration(
                hintText: 'Escribe una nota…',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: BorderSide.none))),
        const SizedBox(height: 12),
        _primary(
            'Guardar registro',
            _selectedMood == null || !_canWrite
                ? null
                : () => _saveEmotion(_selectedMood!)),
        const SizedBox(height: 20),
        EmotionHistoryPanel(
            key: ValueKey(_profileId),
            apiUrl: movaApiUrl,
            deviceId: _deviceId ?? '',
            profileId: _profileId,
            token: widget.token),
        const SizedBox(height: 20)
      ];
  Widget _originalEmotionChoice(dynamic mood) {
    final active = _selectedMood == mood['label'];
    const colors = {
      'great': Color(0xff5ecfa8),
      'good': Color(0xff6b9fff),
      'neutral': Color(0xffa882f5),
      'tired': Color(0xfff5a84b),
      'sad': Color(0xfff5795a),
      'angry': Color(0xfff97316),
      'stressed': Color(0xfff590b8)
    };
    final color = colors[mood['code']] ?? _accent;
    return Semantics(
        button: true,
        selected: active,
        label: mood['label'],
        child: InkWell(
            onTap: !_canWrite
                ? null
                : () => _updateUi(() => _selectedMood = mood['label']),
            borderRadius: BorderRadius.circular(16),
            child: Container(
                decoration: BoxDecoration(
                    color: active ? color.withValues(alpha: .13) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: active ? color : const Color(0x10000000),
                        width: active ? 2 : 1)),
                child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(mood['emoji'], style: const TextStyle(fontSize: 25)),
                      const SizedBox(height: 5),
                      Text(mood['label'],
                          style: TextStyle(
                              fontSize: 11,
                              color: active ? color : _ink,
                              fontWeight: FontWeight.w700))
                    ]))));
  }

  Widget _settingsItem(
          IconData icon, String title, String subtitle, VoidCallback? action) =>
      ListTile(
          dense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14),
          leading: Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                  color: _accent.withValues(alpha: .12),
                  borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: _accent, size: 19)),
          title: Text(title,
              style: const TextStyle(
                  color: _ink, fontSize: 13, fontWeight: FontWeight.w700)),
          subtitle: Text(subtitle,
              style: const TextStyle(color: _muted, fontSize: 10)),
          trailing: Icon(Icons.chevron_right, color: _accent, size: 18),
          onTap: action);
  Widget _settingsGroup(List<Widget> children) => Container(
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(20)),
      child: Column(children: children));
  List<Widget> _originalSettings() {
    final linked =
        _devices.where((d) => d['profile_id'] == _profileId).toList();
    return [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('Perfiles',
            style: TextStyle(
                color: _ink, fontSize: 14, fontWeight: FontWeight.w800)),
        TextButton.icon(
            onPressed: () => _profileForm(create: true),
            icon: const Icon(Icons.add, size: 17),
            label: const Text('Perfil'))
      ]),
      SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: [
            for (final profile in _profiles)
              Padding(
                  padding: const EdgeInsets.only(right: 7),
                  child: ChoiceChip(
                      label: Text(profile['name']),
                      selected: profile['id'] == _profileId,
                      selectedColor: _accent.withValues(alpha: .2),
                      onSelected: (_) => _selectProfile(profile['id'])))
          ])),
      const SizedBox(height: 10),
      InkWell(
          onTap: !_canWrite ? null : () => _profileForm(),
          borderRadius: BorderRadius.circular(20),
          child: _card(Row(children: [
            _avatar(size: 52),
            const SizedBox(width: 13),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(_profile?['name'] ?? '',
                      style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: _ink,
                          fontSize: 16)),
                  const SizedBox(height: 3),
                  Text(
                      '${_profile?['age'] == null ? 'Edad sin indicar' : '${_profile!['age']} años'} · ${_account['email'] ?? ''}',
                      style: const TextStyle(color: _muted, fontSize: 12))
                ])),
            Icon(Icons.edit_outlined, color: _accent)
          ]))),
      _label('CUENTA'),
      _settingsGroup([
        _settingsItem(
            Icons.person_outline,
            'Perfil de usuario',
            'Editar datos personales',
            !_canWrite ? null : () => _profileForm()),
        if (_profile?['role'] == 'owner')
          _settingsItem(Icons.people_outline, 'Cuidadores',
              'Gestionar permisos del perfil', _members),
        _settingsItem(
            Icons.notifications_none,
            'Notificaciones',
            _alertsExpanded
                ? 'Alertas de MOVA Kids'
                : 'Preferencias de alertas',
            () => _updateUi(() => _alertsExpanded = !_alertsExpanded)),
        if (_alertsExpanded && _preferences != null)
          Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
              child: Column(children: [
                for (final item in const {
                  'vibration': 'Vibración',
                  'sound': 'Sonido',
                  'lights': 'Luces'
                }.entries)
                  SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      dense: true,
                      title: Text(item.value,
                          style: const TextStyle(fontSize: 12, color: _ink)),
                      value: _preferences![item.key],
                      activeThumbColor: _accent,
                      onChanged: !_canWrite
                          ? null
                          : (value) => _mutate(
                              'PATCH', '$_path/settings', {item.key: value})),
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Intensidad de vibración',
                          style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: _ink)),
                      Text('${_preferences!['intensity']}/10',
                          style: TextStyle(
                              color: _accent,
                              fontWeight: FontWeight.w900,
                              fontSize: 12))
                    ]),
                Slider(
                    value: (_preferences!['intensity'] as num).toDouble(),
                    min: 0,
                    max: 10,
                    divisions: 10,
                    activeColor: _accent,
                    onChanged: !_canWrite
                        ? null
                        : (v) => _updateUi(
                            () => _preferences!['intensity'] = v.round()),
                    onChangeEnd: !_canWrite
                        ? null
                        : (v) => _mutate('PATCH', '$_path/settings',
                            {'intensity': v.round()})),
                const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Suave',
                          style: TextStyle(fontSize: 9, color: _muted)),
                      Text('Intensa',
                          style: TextStyle(fontSize: 9, color: _muted))
                    ])
              ])),
        _settingsItem(
            Icons.lock_outline,
            'Privacidad y seguridad',
            'Cuenta y protección de datos',
            () => _updateUi(() => _privacyExpanded = !_privacyExpanded)),
        if (_privacyExpanded)
          Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                        'Tus perfiles, emociones y preferencias se guardan en la base de datos de MOVA. Los cuidadores acceden según los permisos que les asignes.',
                        style: TextStyle(
                            fontSize: 11, height: 1.45, color: _muted)),
                    TextButton(
                        onPressed: _changePassword,
                        child: const Text('Cambiar contraseña'))
                  ]))
      ]),
      _label('APLICACIÓN'),
      _settingsGroup([
        _settingsItem(Icons.language, 'Idioma', _language, _changeLanguage)
      ]),
      _label('CONEXIONES'),
      _settingsGroup([
        _settingsItem(
            Icons.watch_outlined,
            'Dispositivo MOVA',
            _deviceId ?? 'Sin reloj vinculado',
            () => _updateUi(() => _deviceExpanded = !_deviceExpanded)),
        if (_deviceExpanded)
          Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (linked.length > 1)
                      DropdownButton<String>(
                          isExpanded: true,
                          value: _deviceId,
                          items: [
                            for (final d in linked)
                              DropdownMenuItem(
                                  value: d['id'] as String,
                                  child: Text(d['name']))
                          ],
                          onChanged: (id) {
                            _updateUi(() {
                              _generation++;
                              _deviceId = id;
                              _state = null;
                            });
                            unawaited(_reload());
                          }),
                    if (_deviceId != null) ...[
                      Text(_deviceId!,
                          style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              color: _ink,
                              fontSize: 13)),
                      const SizedBox(height: 6),
                      Text(
                          'Pasos: ${_state?['payload']?['steps'] ?? 'Sin datos'} · Pulso: ${_state?['payload']?['heartRate'] ?? 'Sin datos'}',
                          style: const TextStyle(color: _muted, fontSize: 11)),
                      TextButton(
                          onPressed:
                              _profile?['role'] != 'owner' ? null : _pair,
                          child: const Text('Generar código de vinculación')),
                      TextButton(
                          onPressed: _profile?['role'] != 'owner'
                              ? null
                              : () => _mutate('DELETE',
                                  '/api/devices/${Uri.encodeComponent(_deviceId!)}'),
                          child: const Text('Desvincular reloj'))
                    ],
                    if (_profile?['role'] == 'owner')
                      _primary('Registrar reloj', _registerDevice,
                          icon: Icons.add)
                  ]))
      ]),
      const SizedBox(height: 18),
      OutlinedButton.icon(
          onPressed: () async {
            try {
              await this._api.post('/api/auth/logout', {});
            } catch (_) {}
            await widget.onLogout();
          },
          icon: const Icon(Icons.logout),
          label: const Text('Cerrar sesión'),
          style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xfff5795a),
              minimumSize: const Size.fromHeight(46),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15)))),
      const SizedBox(height: 12),
      const Center(
          child: Text('MOVA · Tu bienestar, conectado',
              style: TextStyle(fontSize: 10, color: _muted)))
    ];
  }

  Future<void> _changePassword() async {
    final fields = await _form(
        'Cambiar contraseña', {'Contraseña actual': '', 'Nueva contraseña': ''},
        passwords: {'Contraseña actual', 'Nueva contraseña'});
    if (fields != null)
      await _mutate('POST', '/api/auth/password', {
        'currentPassword': fields['Contraseña actual'],
        'newPassword': fields['Nueva contraseña']
      });
  }

  Future<void> _changeLanguage() async {
    final fields = await _form('Idioma', {'Idioma': _language});
    if (fields != null)
      await _mutate('PATCH', '/api/settings', {'language': fields['Idioma']});
  }

  Future<void> _originalNotifications() async {
    await showModalBottomSheet<void>(
        context: context,
        backgroundColor: Colors.white,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        builder: (sheet) => SafeArea(
            child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 25),
                child: ConstrainedBox(
                    constraints: BoxConstraints(
                        maxHeight: MediaQuery.sizeOf(sheet).height * .65),
                    child: SingleChildScrollView(
                        child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          const Text('Notificaciones',
                              style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 18,
                                  color: _ink)),
                          const SizedBox(height: 12),
                          if (_notices.isEmpty)
                            const Text('No hay avisos todavía.',
                                style: TextStyle(color: _muted, fontSize: 12)),
                          for (final notice in _notices)
                            ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: Icon(
                                    notice['kind'] == 'sos'
                                        ? Icons.sos
                                        : Icons.notifications_none,
                                    color: _accent),
                                title: Text(notice['title'],
                                    style: const TextStyle(
                                        fontSize: 13, color: _ink)),
                                subtitle: Text(
                                    '${notice['body']} · ${_prettyDate(DateTime.parse(notice['created_at']).toLocal())}',
                                    style: const TextStyle(
                                        fontSize: 11, color: _muted)),
                                trailing: notice['read_at'] == null
                                    ? IconButton(
                                        tooltip: 'Marcar leído',
                                        icon: Icon(Icons.done, color: _accent),
                                        onPressed: () async {
                                          Navigator.pop(sheet);
                                          await _mutate(
                                              'POST',
                                              '/api/notifications/${notice['id']}/read',
                                              {});
                                        })
                                    : const Icon(Icons.check_circle,
                                        color: Color(0xff5ecfa8)))
                        ]))))));
  }
}
