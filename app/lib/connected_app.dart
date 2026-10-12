part of 'main.dart';

class ConnectedAuthGate extends StatefulWidget {
  const ConnectedAuthGate({super.key});
  @override
  State<ConnectedAuthGate> createState() => _ConnectedAuthGateState();
}

class _ConnectedAuthGateState extends State<ConnectedAuthGate> {
  String? _token;
  bool _restoring = true;
  bool _signup = false;
  @override
  void initState() {
    super.initState();
    unawaited(_restore());
  }

  Future<void> _restore() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('mova_session');
      if (token != null) {
        await MovaApi(token).get('/api/auth/me');
        if (mounted) setState(() => _token = token);
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _restoring = false);
    }
  }

  Future<void> _session(String? token) async {
    final prefs = await SharedPreferences.getInstance();
    if (token == null) {
      await prefs.remove('mova_session');
    } else {
      await prefs.setString('mova_session', token);
    }
    if (mounted)
      setState(() {
        _token = token;
        _signup = false;
      });
  }

  @override
  Widget build(BuildContext context) {
    if (_restoring)
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    final page = _token != null
        ? ConnectedDashboard(token: _token!, onLogout: () => _session(null))
        : _signup
            ? SignupScreen(
                onBack: () => setState(() => _signup = false),
                onCreate: (
                    {String? name,
                    required String email,
                    String? age,
                    String? phone}) {},
                register: (data) async {
                  final result =
                      await MovaApi('').post('/api/auth/register', data);
                  await _session(result['token']);
                })
            : LoginScreen(
                onSignup: () => setState(() => _signup = true),
                onLogin: (
                    {String? name,
                    required String email,
                    String? age,
                    String? phone}) {},
                authenticate: (email, password) async {
                  final result = await MovaApi('').post('/api/auth/login',
                      {'email': email, 'password': password});
                  await _session(result['token']);
                });
    return _OriginalPhoneFrame(
        background: _token == null
            ? (_signup ? const Color(0xfffff3e8) : const Color(0xffe7f0ff))
            : _sectionBackgrounds[0],
        child: page);
  }
}

class ConnectedDashboard extends StatefulWidget {
  const ConnectedDashboard(
      {super.key, required this.token, required this.onLogout});
  final String token;
  final Future<void> Function() onLogout;
  @override
  State<ConnectedDashboard> createState() => _ConnectedDashboardState();
}

class _ConnectedDashboardState extends State<ConnectedDashboard> {
  late final MovaApi _api;
  Timer? _timer;
  bool _loading = false, _writing = false;
  int _tab = 0, _generation = 0;
  String? _profileId, _deviceId, _error, _selectedMood;
  List<dynamic> _profiles = [],
      _devices = [],
      _tasks = [],
      _events = [],
      _notices = [],
      _emotions = [],
      _tags = [];
  Map<String, dynamic>? _state, _preferences;
  String? _taskDate;
  final _note = TextEditingController();
  final Set<String> _selectedTags = {};
  Map<String, dynamic>? get _profile => _profiles
      .where((p) => p['id'] == _profileId)
      .cast<Map<String, dynamic>>()
      .firstOrNull;
  Map<String, dynamic> _account = {};
  String _language = 'Español';
  bool _alertsExpanded = false,
      _deviceExpanded = false,
      _privacyExpanded = false;
  DateTime _calendarMonth =
      DateTime(DateTime.now().year, DateTime.now().month, 1);
  DateTime _calendarDay = DateTime.now();
  void _updateUi(VoidCallback change) => setState(change);
  bool get _canWrite => _profile?['role'] != 'viewer' && !_writing;
  String get _path => '/api/profiles/$_profileId';
  @override
  void initState() {
    super.initState();
    _api = MovaApi(widget.token);
    unawaited(_reload());
    _timer =
        Timer.periodic(const Duration(seconds: 4), (_) => unawaited(_reload()));
  }

  @override
  void dispose() {
    _timer?.cancel();
    _note.dispose();
    super.dispose();
  }

  void _message(Object value) {
    if (mounted)
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(value.toString().replaceFirst('Exception: ', ''))));
  }

  Future<void> _reload() async {
    if (_loading || !mounted) return;
    _loading = true;
    final generation = _generation;
    try {
      final base = await Future.wait([
        _api.get('/api/profiles'),
        _api.get('/api/devices'),
        _api.get('/api/catalog'),
        _api.get('/api/auth/me'),
        _api.get('/api/settings')
      ]);
      final profiles = base[0] as List;
      final devices = base[1] as List;
      final id = profiles.any((p) => p['id'] == _profileId)
          ? _profileId
          : (profiles.isEmpty ? null : profiles.first['id'] as String);
      final linked = devices.where((d) => d['profile_id'] == id).toList();
      final device = linked.any((d) => d['id'] == _deviceId)
          ? _deviceId
          : (linked.isEmpty ? null : linked.first['id'] as String);
      List<dynamic> detail = [];
      if (id != null)
        detail = await Future.wait([
          _api.get('/api/profiles/$id/tasks'),
          _api.get('/api/profiles/$id/calendar'),
          _api.get('/api/profiles/$id/settings'),
          _api.get('/api/profiles/$id/notifications'),
          if (device != null)
            _api.get('/api/devices/${Uri.encodeComponent(device)}/state')
        ]);
      if (!mounted || generation != _generation) return;
      setState(() {
        _profiles = profiles;
        _devices = devices;
        _profileId = id;
        _deviceId = device;
        _account = Map<String, dynamic>.from(base[3]);
        _language = base[4]['language'];
        _emotions = List.of(base[2]['emotions']);
        const moodOrder = [
          'great',
          'good',
          'neutral',
          'tired',
          'sad',
          'angry',
          'stressed'
        ];
        _emotions.sort((a, b) => moodOrder
            .indexOf(a['code'])
            .compareTo(moodOrder.indexOf(b['code'])));
        _tags = base[2]['tags'];
        _error = null;
        if (detail.isNotEmpty) {
          _tasks = detail[0]['tasks'];
          _taskDate = detail[0]['date'];
          _events = detail[1];
          _preferences = detail[2];
          _notices = detail[3];
          _state = device == null ? null : detail[4];
        } else {
          _tasks = [];
          _events = [];
          _notices = [];
          _state = null;
        }
      });
    } catch (error) {
      if (mounted)
        setState(
            () => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      _loading = false;
    }
  }

  Future<void> _mutate(String method, String path,
      [Map<String, dynamic>? body]) async {
    if (_writing) return;
    setState(() => _writing = true);
    try {
      await _api.request(method, path, body);
      await _reload();
    } catch (error) {
      _message(error);
    } finally {
      if (mounted) setState(() => _writing = false);
    }
  }

  Future<Map<String, String>?> _form(String title, Map<String, String> defaults,
      {Set<String> passwords = const {}, Widget? header}) async {
    final controllers = {
      for (final item in defaults.entries)
        item.key: TextEditingController(text: item.value)
    };
    final result = await showDialog<Map<String, String>>(
        context: context,
        builder: (ctx) => AlertDialog(
                backgroundColor: _sectionBackgrounds[_tab],
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24)),
                title: Text(title,
                    style: const TextStyle(
                        color: _ink, fontWeight: FontWeight.w800)),
                content: SingleChildScrollView(
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                  if (header != null) header,
                  for (final item in controllers.entries)
                    Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: TextField(
                            controller: item.value,
                            obscureText: passwords.contains(item.key),
                            decoration: InputDecoration(
                                labelText: item.key,
                                filled: true,
                                fillColor: Colors.white,
                                border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(13)),
                                focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(13),
                                    borderSide: BorderSide(
                                        color: _sectionColors[_tab])))))
                ])),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Cancelar')),
                  FilledButton(
                      onPressed: () => Navigator.pop(ctx, {
                            for (final item in controllers.entries)
                              item.key: item.value.text
                          }),
                      style: FilledButton.styleFrom(
                          backgroundColor: _sectionColors[_tab],
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(13))),
                      child: const Text('Guardar'))
                ]));
    // Dispose after the dialog route has finished its transition.
    Future<void>.delayed(const Duration(milliseconds: 300), () {
      for (final c in controllers.values) {
        c.dispose();
      }
    });
    return result;
  }

  Future<void> _profileForm({bool create = false}) async {
    String photo = create ? '' : _profile?['photo'] ?? '';
    final fields = await _form(
        create ? 'Nuevo perfil' : 'Editar perfil',
        {
          'Nombre': create ? '' : _profile?['name'] ?? '',
          'Edad': create ? '' : (_profile?['age'] ?? '').toString(),
          'Diagnóstico o descripción':
              create ? '' : _profile?['diagnosis'] ?? ''
        },
        header: StatefulBuilder(
            builder: (ctx, updatePhoto) => Column(children: [
                  CircleAvatar(
                      radius: 33,
                      backgroundColor:
                          _sectionColors[_tab].withValues(alpha: .2),
                      backgroundImage: photo.isEmpty
                          ? null
                          : MemoryImage(base64Decode(photo)),
                      child: photo.isEmpty
                          ? const Icon(Icons.person_outline, size: 30)
                          : null),
                  const SizedBox(height: 8),
                  const Text('Fotografía de perfil',
                      style:
                          TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  Wrap(spacing: 8, children: [
                    for (final (source, icon, label) in [
                      (
                        ImageSource.gallery,
                        Icons.photo_library_outlined,
                        'Galería'
                      ),
                      (ImageSource.camera, Icons.camera_alt_outlined, 'Cámara')
                    ])
                      TextButton.icon(
                          onPressed: () async {
                            try {
                              final image = await ImagePicker().pickImage(
                                  source: source,
                                  imageQuality: 70,
                                  maxWidth: 600);
                              if (image == null) return;
                              final value =
                                  base64Encode(await image.readAsBytes());
                              if (value.length > 500000) {
                                _message(
                                    'La fotografía es demasiado grande. Elige una imagen más pequeña.');
                                return;
                              }
                              if (ctx.mounted) updatePhoto(() => photo = value);
                            } catch (error) {
                              _message(error);
                            }
                          },
                          icon: Icon(icon, size: 18),
                          label: Text(label))
                  ]),
                  const SizedBox(height: 8)
                ])));

    if (fields == null) return;
    final age = fields['Edad']!.isEmpty ? null : int.tryParse(fields['Edad']!);
    if (fields['Edad']!.isNotEmpty && (age == null || age < 0 || age > 120)) {
      _message('La edad debe ser un número entre 0 y 120');
      return;
    }
    if (create && photo.isNotEmpty) {
      if (_writing) return;
      setState(() => _writing = true);
      try {
        final profile = await _api.post('/api/profiles', {
          'name': fields['Nombre'],
          'age': age,
          'diagnosis': fields['Diagnóstico o descripción']
        });
        await _api.patch('/api/profiles/${profile['id']}', {'photo': photo});
        await _reload();
      } catch (error) {
        _message(error);
      } finally {
        if (mounted) setState(() => _writing = false);
      }
      return;
    }
    await _mutate(create ? 'POST' : 'PATCH', create ? '/api/profiles' : _path, {
      'name': fields['Nombre'],
      'age': age,
      'photo': photo,
      'diagnosis': fields['Diagnóstico o descripción']
    });
  }

  Future<void> _registerDevice() async {
    final fields = await _form('Registrar reloj',
        {'Identificador': 'MOVA-2841', 'Nombre': 'MOVA Kids'});
    if (fields == null) return;
    await _mutate('POST', '/api/devices', {
      'id': fields['Identificador'],
      'name': fields['Nombre'],
      'profileId': _profileId
    });
  }

  Future<void> _pair() async {
    try {
      final result = await _api
          .post('/api/devices/${Uri.encodeComponent(_deviceId!)}/pairing', {});
      if (!mounted) return;
      await showDialog<void>(
          context: context,
          builder: (ctx) => AlertDialog(
                  title: const Text('Vincular simulador'),
                  content: Column(mainAxisSize: MainAxisSize.min, children: [
                    const Text(
                        'Abre el reloj en localhost:8444 e ingresa este código. Vence en 10 minutos.'),
                    const SizedBox(height: 16),
                    SelectableText(result['code'],
                        style: const TextStyle(
                            fontSize: 22, fontWeight: FontWeight.bold))
                  ]),
                  actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cerrar'))
                  ]));
    } catch (error) {
      _message(error);
    }
  }

  Future<void> _taskForm([Map<String, dynamic>? old]) async {
    final fields = await _form(old == null ? 'Nueva tarea' : 'Editar tarea', {
      'Título': old?['title'] ?? '',
      'Icono': old?['icon'] ?? '📋',
      'Hora (HH:MM)':
          (old?['scheduled_time'] ?? '08:00').toString().substring(0, 5),
      'Días (1=lun, 7=dom)':
          (old?['weekdays'] as List? ?? [1, 2, 3, 4, 5, 6, 7]).join(',')
    });
    if (fields == null) return;
    await _mutate(old == null ? 'POST' : 'PATCH',
        old == null ? '$_path/tasks' : '/api/tasks/${old['id']}', {
      'title': fields['Título'],
      'icon': fields['Icono'],
      'time': fields['Hora (HH:MM)'],
      'weekdays': fields['Días (1=lun, 7=dom)']!
          .split(',')
          .map((d) => int.tryParse(d.trim()))
          .toList()
    });
  }

  Future<void> _eventForm([Map<String, dynamic>? old]) async {
    String fmt(DateTime d) =>
        '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
    final clock = DateTime.now();
    final now = DateTime(_calendarDay.year, _calendarDay.month,
        _calendarDay.day, clock.hour, clock.minute);
    final fields = await _form(old == null ? 'Nuevo evento' : 'Editar evento', {
      'Título': old?['title'] ?? '',
      'Inicio (AAAA-MM-DD HH:MM)':
          fmt(old == null ? now : DateTime.parse(old['starts_at']).toLocal()),
      'Fin (AAAA-MM-DD HH:MM)': fmt(old == null
          ? now.add(const Duration(hours: 1))
          : DateTime.parse(old['ends_at']).toLocal()),
      'Notas': old?['notes'] ?? ''
    });
    if (fields == null) return;
    final start = DateTime.tryParse(fields['Inicio (AAAA-MM-DD HH:MM)']!);
    final end = DateTime.tryParse(fields['Fin (AAAA-MM-DD HH:MM)']!);
    if (start == null || end == null) {
      _message('Revisa el formato de las fechas');
      return;
    }
    await _mutate(old == null ? 'POST' : 'PATCH',
        old == null ? '$_path/calendar' : '/api/calendar/${old['id']}', {
      'title': fields['Título'],
      'startsAt': start.toUtc().toIso8601String(),
      'endsAt': end.toUtc().toIso8601String(),
      'notes': fields['Notas']
    });
  }

  Future<void> _saveEmotion(String label) async {
    if (_writing) return;
    setState(() => _writing = true);
    try {
      final body = {
        'mood': label,
        'note': _note.text,
        'tags': _selectedTags.toList()
      };
      if (_deviceId != null) {
        await _api.patch(
            '/api/devices/${Uri.encodeComponent(_deviceId!)}/state', body);
      } else {
        await _api.post('$_path/emotions', body);
      }
      _note.clear();
      if (mounted) setState(() => _selectedTags.clear());
      _message('Emoción guardada con fecha y hora');
      await _reload();
    } catch (error) {
      _message(error);
    } finally {
      if (mounted) setState(() => _writing = false);
    }
  }

  Future<void> _members() async {
    try {
      final members = await _api.get('$_path/members') as List;
      if (!mounted) return;
      await showDialog<String>(
          context: context,
          builder: (ctx) => AlertDialog(
                  title: const Text('Cuidadores del perfil'),
                  content: Column(mainAxisSize: MainAxisSize.min, children: [
                    for (final member in members)
                      ListTile(
                          title: Text(member['name']),
                          subtitle:
                              Text('${member['email']} · ${member['role']}'),
                          trailing: member['role'] == 'owner'
                              ? null
                              : IconButton(
                                  icon: const Icon(Icons.remove_circle_outline),
                                  onPressed: () async {
                                    await _mutate('DELETE',
                                        '$_path/members/${member['id']}');
                                    if (ctx.mounted) Navigator.pop(ctx);
                                  })),
                    TextButton(
                        onPressed: () => Navigator.pop(ctx, 'add'),
                        child: const Text('Agregar cuidador'))
                  ]),
                  actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cerrar'))
                  ])).then((value) async {
        if (value == 'add') {
          final f = await _form('Agregar persona registrada',
              {'Correo': '', 'Rol (caregiver o viewer)': 'caregiver'});
          if (f != null)
            await _mutate('POST', '$_path/members',
                {'email': f['Correo'], 'role': f['Rol (caregiver o viewer)']});
        }
      });
    } catch (error) {
      _message(error);
    }
  }

  @override
  Widget build(BuildContext context) => _originalDashboard(context);
}
