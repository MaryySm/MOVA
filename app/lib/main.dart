import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'controllers/auth_api.dart';
import 'models/auth_session.dart';

const _ink = Color(0xff1a1a2e);
const _muted = Color(0xff68677e);
const _api = String.fromEnvironment('MOVA_API_URL',
    defaultValue: 'http://10.0.2.2:3000');
const _serviceUuid = String.fromEnvironment('MOVA_BLE_SERVICE_UUID');
const _dataUuid = String.fromEnvironment('MOVA_BLE_DATA_UUID');

const _sectionColors = <Color>[
  Color(0xfff590b8),
  Color(0xfff5a84b),
  Color(0xffa882f5),
  Color(0xfff5795a),
  Color(0xffc47df5),
];
const _sectionBackgrounds = <Color>[
  Color(0xfffff0f5),
  Color(0xfffff4e6),
  Color(0xfff5f0ff),
  Color(0xfffff5f0),
  Color(0xfff8f0ff),
];

void main() => runApp(const MovaApp());

class MovaApp extends StatelessWidget {
  const MovaApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'MOVA',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          scaffoldBackgroundColor: const Color(0xfffff0f5),
          colorScheme: ColorScheme.fromSeed(seedColor: _sectionColors[0]),
          fontFamily: 'Roboto',
        ),
        home: const AuthGate(),
      );
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  String _page = 'login';
  final _authApi = AuthApi();
  AuthSession? _session;

  Future<void> _login({required String email, required String password}) async {
    final session = await _authApi.login(email: email, password: password);
    if (mounted) setState(() => _session = session);
  }

  Future<void> _register({
    required String adultName,
    required String name,
    required String age,
    required String phone,
    required String email,
    required String diagnosis,
    required String password,
  }) async {
    final session = await _authApi.register(
      adultName: adultName,
      name: name,
      age: age,
      phone: phone,
      email: email,
      diagnosis: diagnosis,
      password: password,
    );
    if (mounted) setState(() => _session = session);
  }

  @override
  Widget build(BuildContext context) {
    final session = _session;
    if (session != null) {
      return MovaShell(
        key: const ValueKey('signed-in'),
        userId: session.id,
        authToken: session.token,
        adultName: session.adultName,
        userName: session.name,
        email: session.email,
        age: session.age,
        phone: session.phone,
        onLogout: () => setState(() => _session = null),
      );
    }
    final page = _page == 'signup'
        ? SignupScreen(
            onBack: () => setState(() => _page = 'login'), onCreate: _register)
        : LoginScreen(
            onSignup: () => setState(() => _page = 'signup'), onLogin: _login);
    if (MediaQuery.sizeOf(context).width <= 600) return page;
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
                    borderRadius: BorderRadius.circular(49), child: page))),
      ),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.onSignup, required this.onLogin});
  final VoidCallback onSignup;
  final Future<void> Function({required String email, required String password})
      onLogin;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _showPassword = false;
  String? _error;
  bool _submitting = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    if (!email.contains('@') || _password.text.isEmpty) {
      setState(() => _error = 'Ingresa un correo valido y tu contrasena.');
      return;
    }
    setState(() {
      _error = null;
      _submitting = true;
    });
    try {
      await widget.onLogin(email: email, password: _password.text);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: const Color(0xffe7f0ff),
        body: SafeArea(
            child: ListView(padding: EdgeInsets.zero, children: [
          Container(
              height: 240,
              padding: const EdgeInsets.only(bottom: 26),
              decoration: const BoxDecoration(
                  gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                    Color(0xffa3c4ff),
                    Color(0xffd0e5ff),
                    Color(0xffe7f0ff)
                  ])),
              child:
                  Column(mainAxisAlignment: MainAxisAlignment.end, children: [
                Container(
                    width: 66,
                    height: 66,
                    decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                            colors: [Color(0xff6b9fff), Color(0xffa8d0ff)])),
                    child: const Icon(Icons.bolt_rounded,
                        color: Colors.white, size: 36)),
                const SizedBox(height: 8),
                const Text('MOVA',
                    style: TextStyle(
                        color: _ink,
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.4))
              ])),
          Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 30),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Bienvenido',
                        style: TextStyle(
                            color: _ink,
                            fontSize: 26,
                            fontWeight: FontWeight.w900)),
                    const SizedBox(height: 4),
                    const Text('Inicia sesión para continuar',
                        style:
                            TextStyle(color: Color(0xff6b84af), fontSize: 14)),
                    const SizedBox(height: 24),
                    _authLabel('CORREO'),
                    const SizedBox(height: 7),
                    TextField(
                        controller: _email,
                        keyboardType: TextInputType.emailAddress,
                        decoration: _authDecoration('tu@correo.com')),
                    const SizedBox(height: 15),
                    _authLabel('CONTRASEÑA'),
                    const SizedBox(height: 7),
                    TextField(
                        controller: _password,
                        obscureText: !_showPassword,
                        onSubmitted: (_) => _submit(),
                        decoration: _authDecoration('••••••••').copyWith(
                            suffixIcon: IconButton(
                                onPressed: () => setState(
                                    () => _showPassword = !_showPassword),
                                icon: Icon(
                                    _showPassword
                                        ? Icons.visibility_off
                                        : Icons.visibility,
                                    color: const Color(0xff6b84af))))),
                    Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                            onPressed: () => showDialog<void>(
                                context: context,
                                builder: (context) => AlertDialog(
                                        title:
                                            const Text('Recuperar contrasena'),
                                        content: const Text(
                                            'La recuperacion de contrasena no esta habilitada. Contacta al equipo MOVA.'),
                                        actions: [
                                          TextButton(
                                              onPressed: () =>
                                                  Navigator.pop(context),
                                              child: const Text('Entendido'))
                                        ])),
                            child: const Text('¿Olvidaste tu contraseña?',
                                style: TextStyle(
                                    color: Color(0xff6b9fff), fontSize: 12)))),
                    if (_error != null)
                      Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Text(_error!,
                              style: const TextStyle(
                                  color: Color(0xffd95648), fontSize: 12))),
                    FilledButton(
                        onPressed: _submitting ? null : _submit,
                        style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xff6b9fff),
                            minimumSize: const Size.fromHeight(50),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(15))),
                        child: _submitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white))
                            : const Text('Iniciar sesion',
                                style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800))),
                    const SizedBox(height: 18),
                    Row(children: [
                      const Expanded(child: Divider()),
                      Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text('o continúa con',
                              style: TextStyle(
                                  color: const Color(0xff6b84af),
                                  fontSize: 12))),
                      const Expanded(child: Divider())
                    ]),
                    const SizedBox(height: 14),
                    Row(children: [
                      Expanded(
                          child: OutlinedButton.icon(
                              onPressed: () => _socialMessage(context),
                              icon: const Icon(Icons.language),
                              label: const Text('Google'))),
                      const SizedBox(width: 10),
                      Expanded(
                          child: OutlinedButton.icon(
                              onPressed: () => _socialMessage(context),
                              icon: const Icon(Icons.apple),
                              label: const Text('Apple')))
                    ]),
                    const SizedBox(height: 20),
                    Center(
                        child: Wrap(alignment: WrapAlignment.center, children: [
                      const Text('¿No tienes cuenta? ',
                          style: TextStyle(
                              color: Color(0xff6b84af), fontSize: 13)),
                      TextButton(
                          onPressed: widget.onSignup,
                          style: TextButton.styleFrom(padding: EdgeInsets.zero),
                          child: const Text('Regístrate',
                              style: TextStyle(
                                  color: Color(0xff6b9fff),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800)))
                    ])),
                    const SizedBox(height: 6),
                    const Text(
                        'Usa el correo y la contrasena registrados en MOVA.',
                        textAlign: TextAlign.center,
                        style:
                            TextStyle(color: Color(0xff8798b5), fontSize: 10)),
                  ])),
        ])),
      );
}

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key, required this.onBack, required this.onCreate});
  final VoidCallback onBack;
  final Future<void> Function({
    required String adultName,
    required String name,
    required String age,
    required String phone,
    required String email,
    required String diagnosis,
    required String password,
  }) onCreate;

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _adult = TextEditingController();
  final _name = TextEditingController();
  final _age = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _diagnosis = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  bool _submitted = false;
  bool _submitting = false;
  bool _showPassword = false;
  String? _error;

  @override
  void dispose() {
    _adult.dispose();
    _name.dispose();
    _age.dispose();
    _phone.dispose();
    _email.dispose();
    _diagnosis.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _submitted = true;
      _error = null;
    });
    if (_adult.text.trim().isEmpty ||
        _name.text.trim().isEmpty ||
        _age.text.trim().isEmpty ||
        _phone.text.length != 8 ||
        !_email.text.contains('@') ||
        _password.text.length < 8 ||
        _password.text != _confirmPassword.text) {
      return;
    }
    setState(() => _submitting = true);
    try {
      await widget.onCreate(
        adultName: _adult.text.trim(),
        name: _name.text.trim(),
        age: _age.text.trim(),
        phone: _phone.text.trim(),
        email: _email.text.trim(),
        diagnosis: _diagnosis.text.trim(),
        password: _password.text,
      );
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
      backgroundColor: const Color(0xfffff3e8),
      body: SafeArea(
          child: ListView(
              padding: const EdgeInsets.fromLTRB(22, 18, 22, 30),
              children: [
            Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                    onPressed: widget.onBack,
                    icon: const Icon(Icons.arrow_back_rounded,
                        color: Color(0xfff29b64)))),
            Row(children: [
              Container(
                  width: 44,
                  height: 44,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                      borderRadius: BorderRadius.all(Radius.circular(14)),
                      gradient: LinearGradient(
                          colors: [Color(0xfff29b64), Color(0xfff6be86)])),
                  child: const Text('M',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 21,
                          fontWeight: FontWeight.w900))),
              const SizedBox(width: 11),
              const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('CREA TU CUENTA',
                        style: TextStyle(
                            color: Color(0xffa86b48),
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1)),
                    Text('Conozc\u00e1monos',
                        style: TextStyle(
                            color: _ink,
                            fontSize: 24,
                            fontWeight: FontWeight.w900))
                  ])
            ]),
            const Padding(
                padding: EdgeInsets.symmetric(vertical: 11),
                child: Text(
                    'Completa los datos para personalizar la experiencia MOVA.',
                    style: TextStyle(color: Color(0xffa86b48), fontSize: 13))),
            _signupField(
                'Nombre y apellido del adulto *', _adult, 'Ej. Maria Gonzalez'),
            _signupField('Nombre del usuario *', _name, 'Ej. Carlos'),
            _signupField('Edad del usuario *', _age, 'Ej. 10', numeric: true),
            const Text('NUMERO DE TELEFONO A SINCRONIZAR *',
                style: TextStyle(
                    color: Color(0xffa86b48),
                    fontSize: 10,
                    fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Row(children: [
              Container(
                  padding: const EdgeInsets.all(13),
                  decoration: const BoxDecoration(
                      color: Color(0xffffe4d2),
                      borderRadius:
                          BorderRadius.horizontal(left: Radius.circular(13))),
                  child: const Text('+569',
                      style: TextStyle(
                          color: Color(0xffa86b48),
                          fontWeight: FontWeight.w800))),
              Expanded(
                  child: TextField(
                      controller: _phone,
                      keyboardType: TextInputType.phone,
                      maxLength: 8,
                      decoration: _authDecoration('12345678')
                          .copyWith(counterText: '')))
            ]),
            const SizedBox(height: 12),
            _signupField('Correo *', _email, 'tu@correo.com', email: true),
            _signupField('Contrasena *', _password, 'Minimo 8 caracteres',
                obscure: !_showPassword,
                trailing: IconButton(
                    onPressed: () =>
                        setState(() => _showPassword = !_showPassword),
                    icon: Icon(_showPassword
                        ? Icons.visibility_off
                        : Icons.visibility))),
            _signupField('Confirmar contrasena *', _confirmPassword,
                'Repite la contrasena',
                obscure: true),
            _signupField('Diagnostico o condicion - Opcional', _diagnosis,
                'Puedes agregarlo despues'),
            if (_submitted && _error != null)
              Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Text(_error!,
                      style: const TextStyle(
                          color: Color(0xffd95648), fontSize: 12))),
            if (_submitted &&
                _error == null &&
                (_adult.text.trim().isEmpty ||
                    _name.text.trim().isEmpty ||
                    _age.text.trim().isEmpty ||
                    _phone.text.length != 8 ||
                    !_email.text.contains('@')))
              const Padding(
                  padding: EdgeInsets.only(bottom: 10),
                  child: Text(
                      'Completa los campos obligatorios y el telefono de 8 digitos.',
                      style:
                          TextStyle(color: Color(0xffd95648), fontSize: 11))),
            if (_submitted &&
                _error == null &&
                (_password.text.length < 8 ||
                    _password.text != _confirmPassword.text))
              const Padding(
                  padding: EdgeInsets.only(bottom: 10),
                  child: Text(
                      'La contrasena debe tener al menos 8 caracteres y ambas deben coincidir.',
                      style:
                          TextStyle(color: Color(0xffd95648), fontSize: 11))),
            FilledButton(
                onPressed: _submitting ? null : _submit,
                style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xfff29b64),
                    minimumSize: const Size.fromHeight(49),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15))),
                child: _submitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Text('Crear cuenta y continuar',
                        style: TextStyle(fontWeight: FontWeight.w800))),
          ])));
}

Widget _authLabel(String label) => Text(label,
    style: const TextStyle(
        color: Color(0xff6b84af),
        fontSize: 10,
        fontWeight: FontWeight.w800,
        letterSpacing: 1));
InputDecoration _authDecoration(String hint) => InputDecoration(
    hintText: hint,
    filled: true,
    fillColor: Colors.white,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
    border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0x226b9fff))),
    enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0x226b9fff))));
Widget _signupField(String label, TextEditingController controller, String hint,
        {bool numeric = false,
        bool email = false,
        bool obscure = false,
        Widget? trailing}) =>
    Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label.toUpperCase(),
              style: const TextStyle(
                  color: Color(0xffa86b48),
                  fontSize: 10,
                  fontWeight: FontWeight.w800)),
          const SizedBox(height: 6),
          TextField(
              controller: controller,
              obscureText: obscure,
              keyboardType: numeric
                  ? TextInputType.number
                  : email
                      ? TextInputType.emailAddress
                      : TextInputType.text,
              decoration: _authDecoration(hint).copyWith(suffixIcon: trailing))
        ]));
void _socialMessage(BuildContext context) =>
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text(
            'El inicio con Google o Apple no está conectado en esta versión de demostración.')));

class _Task {
  _Task(this.title, this.time, this.color, {this.done = false});
  final String title;
  final String time;
  final Color color;
  bool done;
}

class _Profile {
  _Profile(
      {required this.id,
      required this.name,
      required this.age,
      required this.email,
      required this.phone,
      this.photo = '',
      this.deviceId = 'MOVA-2841',
      this.deviceName = 'MOVA Band Pro',
      this.battery = 84,
      this.steps = 8420,
      this.vibration = true,
      this.sound = true,
      this.lights = true,
      this.intensity = 6});
  final String id;
  String name;
  String age;
  String email;
  String phone;
  String photo;
  String deviceId;
  String deviceName;
  int battery;
  int steps;
  bool vibration;
  bool sound;
  bool lights;
  int intensity;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'age': age,
        'email': email,
        'phone': phone,
        'photo': photo,
        'deviceId': deviceId,
        'deviceName': deviceName,
        'battery': battery,
        'steps': steps,
        'vibration': vibration,
        'sound': sound,
        'lights': lights,
        'intensity': intensity
      };
  factory _Profile.fromJson(Map<String, dynamic> json) => _Profile(
      id: json['id'] as String? ?? 'carlos',
      name: json['name'] as String? ?? 'Carlos Rodríguez',
      age: json['age'] as String? ?? '10',
      email: json['email'] as String? ?? 'carlos@mova.app',
      phone: json['phone'] as String? ?? '12345678',
      photo: json['photo'] as String? ?? '',
      deviceId: json['deviceId'] as String? ?? 'MOVA-2841',
      deviceName: json['deviceName'] as String? ?? 'MOVA Band Pro',
      battery: json['battery'] as int? ?? 84,
      steps: json['steps'] as int? ?? 8420,
      vibration: json['vibration'] as bool? ?? true,
      sound: json['sound'] as bool? ?? true,
      lights: json['lights'] as bool? ?? true,
      intensity: json['intensity'] as int? ?? 6);
}

class _Mood {
  const _Mood(this.face, this.name, this.color);
  final String face;
  final String name;
  final Color color;
}

const _moods = <_Mood>[
  _Mood('😄', 'Genial', Color(0xff5ecfa8)),
  _Mood('🙂', 'Bien', Color(0xff6b9fff)),
  _Mood('😐', 'Regular', Color(0xffa882f5)),
  _Mood('😴', 'Cansado', Color(0xfff5a84b)),
  _Mood('😔', 'Bajo', Color(0xfff5795a)),
];

class MovaShell extends StatefulWidget {
  const MovaShell(
      {super.key,
      required this.userId,
      required this.authToken,
      required this.adultName,
      required this.userName,
      required this.email,
      required this.age,
      required this.phone,
      required this.onLogout});
  final String userId;
  final String authToken;
  final String adultName;
  final String userName;
  final String email;
  final String age;
  final String phone;
  final VoidCallback onLogout;

  @override
  State<MovaShell> createState() => _MovaShellState();
}

class _MovaShellState extends State<MovaShell> {
  int _tab = 0;
  bool _showDevice = false;
  bool _scanning = false;
  String _deviceLabel = 'Sin dispositivo conectado';
  String _syncLabel = 'Tus datos están al día';
  String? _bpm;
  String? _mood;
  String? _savedMood;
  String _note = '';
  final Set<String> _tags = {};
  late List<_Profile> _profiles;
  late String _activeProfileId;
  bool _alertsExpanded = false;
  bool _deviceExpanded = false;
  bool _privacyExpanded = false;
  String _language = 'Español';
  BluetoothDevice? _connected;
  final List<ScanResult> _found = [];
  StreamSubscription<List<ScanResult>>? _scanSub;
  StreamSubscription<List<int>>? _dataSub;
  final List<_Task> _tasks = [
    _Task('⏰  Levantarme', '06:30', const Color(0xfff5a84b)),
    _Task('🛁  Bañarme', '06:45', const Color(0xff5bb8f5), done: true),
    _Task('🪥  Lavarme los dientes', '07:00', const Color(0xff5ecfa8),
        done: true),
    _Task('🥣  Tomar desayuno', '07:15', const Color(0xfff5a84b)),
    _Task('🏫  Ir al colegio', '08:00', const Color(0xff6b9fff)),
    _Task('🍽️  Almorzar', '13:00', const Color(0xfff5a84b)),
    _Task('⚽  Taller de fútbol', '16:00', const Color(0xff5ecfa8)),
    _Task('🌙  Preparar para dormir', '21:00', const Color(0xff9b72f5)),
  ];

  _Profile get _profile =>
      _profiles.firstWhere((profile) => profile.id == _activeProfileId,
          orElse: () => _profiles.first);

  @override
  void initState() {
    super.initState();
    _profiles = [
      _Profile(
          id: 'main',
          name: widget.userName,
          age: widget.age,
          email: widget.email,
          phone: widget.phone)
    ];
    _activeProfileId = 'main';
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final preferences = await SharedPreferences.getInstance();
    final rawProfiles = preferences.getString('mova_profiles_${widget.userId}');
    if (rawProfiles != null) {
      try {
        final decoded = jsonDecode(rawProfiles) as List<dynamic>;
        final profiles = decoded
            .map((item) => _Profile.fromJson(item as Map<String, dynamic>))
            .toList();
        if (profiles.isNotEmpty && mounted) {
          setState(() {
            _profiles = profiles;
            _activeProfileId =
                preferences.getString('mova_active_profile_${widget.userId}') ??
                    profiles.first.id;
            if (!profiles.any((profile) => profile.id == _activeProfileId))
              _activeProfileId = profiles.first.id;
          });
        }
      } catch (_) {}
    }
    if (mounted)
      setState(() =>
          _language = preferences.getString('mova_language') ?? 'Español');
  }

  Future<void> _savePreferences() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString('mova_profiles_${widget.userId}',
        jsonEncode(_profiles.map((profile) => profile.toJson()).toList()));
    await preferences.setString(
        'mova_active_profile_${widget.userId}', _activeProfileId);
  }

  Future<void> _editProfile() async {
    final profile = _profile;
    final name = TextEditingController(text: profile.name);
    final age = TextEditingController(text: profile.age);
    final email = TextEditingController(text: profile.email);
    final phone = TextEditingController(text: profile.phone);
    final formKey = GlobalKey<FormState>();
    var photo = profile.photo;
    Future<void> pickPhoto(ImageSource source, StateSetter updateDialog) async {
      final file = await ImagePicker()
          .pickImage(source: source, imageQuality: 78, maxWidth: 900);
      if (file == null) return;
      photo = base64Encode(await file.readAsBytes());
      updateDialog(() {});
    }

    await showDialog<void>(
        context: context,
        builder: (dialogContext) => StatefulBuilder(
            builder: (dialogContext, updateDialog) => AlertDialog(
                  title: const Text('Editar perfil'),
                  content: Form(
                      key: formKey,
                      child: SingleChildScrollView(
                          child:
                              Column(mainAxisSize: MainAxisSize.min, children: [
                        CircleAvatar(
                            radius: 33,
                            backgroundImage: photo.isEmpty
                                ? null
                                : MemoryImage(base64Decode(photo)),
                            child: photo.isEmpty
                                ? Text(
                                    name.text.isEmpty
                                        ? 'U'
                                        : name.text[0].toUpperCase(),
                                    style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w900))
                                : null),
                        const SizedBox(height: 8),
                        const Text('Fotografía de perfil',
                            style: TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w700)),
                        Wrap(spacing: 8, children: [
                          TextButton.icon(
                              onPressed: () =>
                                  pickPhoto(ImageSource.gallery, updateDialog),
                              icon: const Icon(Icons.photo_library_outlined),
                              label: const Text('Galería')),
                          TextButton.icon(
                              onPressed: () =>
                                  pickPhoto(ImageSource.camera, updateDialog),
                              icon: const Icon(Icons.camera_alt_outlined),
                              label: const Text('Cámara'))
                        ]),
                        TextFormField(
                            controller: name,
                            decoration: const InputDecoration(
                                labelText: 'Nombre de usuario'),
                            validator: (value) =>
                                value == null || value.trim().isEmpty
                                    ? 'Escribe un nombre'
                                    : null),
                        TextFormField(
                            controller: age,
                            keyboardType: TextInputType.number,
                            decoration:
                                const InputDecoration(labelText: 'Edad'),
                            validator: (value) =>
                                value == null || value.trim().isEmpty
                                    ? 'Escribe la edad'
                                    : null),
                        TextFormField(
                            controller: email,
                            keyboardType: TextInputType.emailAddress,
                            decoration:
                                const InputDecoration(labelText: 'Correo'),
                            validator: (value) =>
                                value == null || !value.contains('@')
                                    ? 'Escribe un correo válido'
                                    : null),
                        TextFormField(
                            controller: phone,
                            keyboardType: TextInputType.phone,
                            maxLength: 8,
                            decoration: const InputDecoration(
                                labelText: 'Teléfono · +569'),
                            validator: (value) =>
                                value == null || value.length != 8
                                    ? 'Debe tener 8 dígitos'
                                    : null),
                      ]))),
                  actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(dialogContext),
                        child: const Text('Cancelar')),
                    FilledButton(
                        onPressed: () async {
                          if (!formKey.currentState!.validate()) return;
                          setState(() {
                            profile.name = name.text.trim();
                            profile.age = age.text.trim();
                            profile.email = email.text.trim();
                            profile.phone = phone.text.trim();
                            profile.photo = photo;
                          });
                          await _savePreferences();
                          if (dialogContext.mounted)
                            Navigator.pop(dialogContext);
                          if (mounted) _message('Perfil actualizado');
                        },
                        child: const Text('Guardar cambios'))
                  ],
                )));
    name.dispose();
    age.dispose();
    email.dispose();
    phone.dispose();
  }

  Future<void> _addProfile() async {
    final number = _profiles.length + 1;
    final profile = _Profile(
        id: 'profile-${DateTime.now().millisecondsSinceEpoch}',
        name: 'Nuevo perfil $number',
        age: '',
        email: '',
        phone: '',
        deviceId: 'MOVA-${1000 + number * 137}',
        battery: 72,
        steps: 0);
    setState(() {
      _profiles.add(profile);
      _activeProfileId = profile.id;
    });
    await _savePreferences();
    if (mounted) await _editProfile();
  }

  Future<void> _changeLanguage() async {
    final language = await showDialog<String>(
        context: context,
        builder: (context) =>
            SimpleDialog(title: const Text('Idioma'), children: [
              for (final language in ['Español', 'English'])
                SimpleDialogOption(
                    onPressed: () => Navigator.pop(context, language),
                    child: Text(language,
                        style: TextStyle(
                            fontWeight: _language == language
                                ? FontWeight.w800
                                : FontWeight.w400)))
            ]));
    if (language == null) return;
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString('mova_language', language);
    if (mounted) setState(() => _language = language);
    if (mounted)
      _message(language == 'Español'
          ? 'Idioma seleccionado: Español'
          : 'English selected. La traducción completa está pendiente en esta demo.');
  }

  void _infoDialog(String title, String body) => showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
              title: Text(title),
              content: Text(body),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cerrar'))
              ]));

  @override
  void dispose() {
    _scanSub?.cancel();
    _dataSub?.cancel();
    super.dispose();
  }

  Future<void> _scan() async {
    if (!kIsWeb) {
      await [
        Permission.bluetoothScan,
        Permission.bluetoothConnect,
        Permission.locationWhenInUse
      ].request();
    }
    if (!mounted) return;
    setState(() {
      _scanning = true;
      _found.clear();
      _deviceLabel = 'Buscando wearables…';
    });
    await _scanSub?.cancel();
    _scanSub = FlutterBluePlus.scanResults.listen((results) {
      if (!mounted) return;
      setState(() {
        for (final result in results) {
          if (!_found
              .any((item) => item.device.remoteId == result.device.remoteId)) {
            _found.add(result);
          }
        }
      });
    });
    try {
      await FlutterBluePlus.startScan(timeout: const Duration(seconds: 10));
      await Future<void>.delayed(const Duration(seconds: 10));
      if (mounted)
        _deviceLabel = _found.isEmpty
            ? 'No encontramos dispositivos'
            : 'Selecciona tu wearable';
    } catch (error) {
      if (mounted) _message('Bluetooth: $error');
    }
    if (mounted) setState(() => _scanning = false);
  }

  Future<void> _connect(BluetoothDevice device) async {
    try {
      await FlutterBluePlus.stopScan();
      await device.connect(timeout: const Duration(seconds: 15));
      _connected = device;
      final services = await device.discoverServices();
      BluetoothCharacteristic? dataCharacteristic;
      for (final service in services) {
        if (_serviceUuid.isNotEmpty &&
            service.uuid.str.toLowerCase() != _serviceUuid.toLowerCase())
          continue;
        for (final characteristic in service.characteristics) {
          if (_dataUuid.isNotEmpty &&
              characteristic.uuid.str.toLowerCase() != _dataUuid.toLowerCase())
            continue;
          if (characteristic.properties.notify ||
              characteristic.properties.read) {
            dataCharacteristic = characteristic;
            break;
          }
        }
        if (dataCharacteristic != null) break;
      }
      if (dataCharacteristic?.properties.notify == true) {
        await dataCharacteristic!.setNotifyValue(true);
        _dataSub = dataCharacteristic.onValueReceived.listen(_receive);
      }
      if (!mounted) return;
      setState(() => _deviceLabel =
          'Conectado: ${device.platformName.isEmpty ? device.remoteId.str : device.platformName}');
      if (dataCharacteristic?.properties.notify != true &&
          dataCharacteristic?.properties.read == true) {
        await _receive(await dataCharacteristic!.read());
      }
      if (_serviceUuid.isEmpty || _dataUuid.isEmpty)
        _message('Configura los UUID BLE del wearable para sincronizar.');
    } catch (error) {
      if (mounted) setState(() => _deviceLabel = 'No se pudo conectar');
      if (mounted) _message('$error');
    }
  }

  Future<void> _receive(List<int> bytes) async {
    final raw = utf8.decode(bytes, allowMalformed: true);
    dynamic payload;
    try {
      payload = jsonDecode(raw);
    } catch (_) {
      payload = {'raw': raw};
    }
    if (payload is Map && payload['heartRate'] != null && mounted) {
      setState(() => _bpm = '${payload['heartRate']}');
    }
    await _sync(payload is Map<String, dynamic> ? payload : {'raw': raw});
  }

  Future<void> _sync(Map<String, dynamic> payload) async {
    if (mounted) setState(() => _syncLabel = 'Sincronizando…');
    try {
      final response = await http
          .post(
            Uri.parse('$_api/api/sync'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ${widget.authToken}',
            },
            body: jsonEncode(
                {'deviceId': _connected?.remoteId.str, 'payload': payload}),
          )
          .timeout(const Duration(seconds: 15));
      if (mounted)
        setState(() => _syncLabel = response.statusCode < 300
            ? 'Sincronizado ahora'
            : 'Error API ${response.statusCode}');
    } catch (_) {
      if (mounted) setState(() => _syncLabel = 'Servidor no disponible');
    }
  }

  void _message(String text) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));

  @override
  Widget build(BuildContext context) {
    final accent = _sectionColors[_tab];
    final background = _sectionBackgrounds[_tab];
    final phone = Scaffold(
      backgroundColor: background,
      body: SafeArea(
        bottom: false,
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 180),
          child: _showDevice
              ? _devicePage(accent, background)
              : switch (_tab) {
                  0 => _homePage(),
                  1 => _routinePage(accent, background),
                  2 => _calendarPage(accent, background),
                  3 => _emotionPage(accent, background),
                  _ => _settingsPage(accent, background),
                },
        ),
      ),
      bottomNavigationBar: _showDevice ? null : _bottomNav(),
    );
    if (MediaQuery.sizeOf(context).width <= 600) return phone;
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
            height:
                MediaQuery.sizeOf(context).height.clamp(600, 844).toDouble(),
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
                child: Stack(children: [
                  phone,
                  Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: Center(
                          child: Container(
                              width: 110,
                              height: 25,
                              decoration: BoxDecoration(
                                  color: background,
                                  borderRadius: const BorderRadius.vertical(
                                      bottom: Radius.circular(14))))))
                ])),
          ),
        ),
      ),
    );
  }

  Widget _bottomNav() => SafeArea(
        top: false,
        child: Container(
          height: 66,
          decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: .96),
              border: const Border(top: BorderSide(color: Color(0x10000000)))),
          child: Row(
            children: [
              _navItem(0, Icons.home_outlined, 'Inicio'),
              _navItem(1, Icons.checklist_rounded, 'Rutinas'),
              _navItem(2, Icons.calendar_month_outlined, 'Agenda'),
              _navItem(3, Icons.mood_outlined, 'Emociones'),
              _navItem(4, Icons.tune_rounded, 'Ajustes'),
            ],
          ),
        ),
      );

  Widget _navItem(int index, IconData icon, String label) {
    final active = _tab == index;
    final color = active ? _sectionColors[index] : const Color(0xffbdb8d4);
    return Expanded(
      child: InkWell(
        onTap: () => setState(() {
          _tab = index;
          _showDevice = false;
        }),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (active)
              Container(
                  width: 28,
                  height: 3,
                  margin: const EdgeInsets.only(bottom: 5),
                  decoration: BoxDecoration(
                      color: color, borderRadius: BorderRadius.circular(3))),
            Icon(icon, color: color, size: 21),
            const SizedBox(height: 2),
            Text(label,
                style: TextStyle(
                    color: color,
                    fontSize: 10,
                    fontWeight: active ? FontWeight.w700 : FontWeight.w400)),
          ],
        ),
      ),
    );
  }

  Widget _homePage() {
    final done = _tasks.where((task) => task.done).length;
    return ListView(
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
          child: Row(
            children: [
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    const Text('Lunes, 10 de agosto 2026',
                        style:
                            TextStyle(color: Color(0xffb06080), fontSize: 12)),
                    SizedBox(height: 3),
                    Text('¡Hola, ${_profile.name.split(' ').first}! 👋',
                        style: const TextStyle(
                            color: _ink,
                            fontSize: 22,
                            fontWeight: FontWeight.w900)),
                  ])),
              Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(13),
                child: InkWell(
                    onTap: _notifications,
                    borderRadius: BorderRadius.circular(13),
                    child: const SizedBox(
                        width: 40,
                        height: 40,
                        child: Icon(Icons.notifications_none_rounded,
                            color: Color(0xfff590b8)))),
              ),
              const SizedBox(width: 9),
              Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                          colors: [Color(0xfff590b8), Color(0xffa882f5)])),
                  child: const Text('C',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 17))),
            ],
          ),
        ),
        _padded(_moodCard()),
        _padded(_mapCard()),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          child:
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Rutina del día',
                style: TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w800, color: _ink)),
            Text('${(done / _tasks.length * 100).round()}% completo',
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Color(0xfff590b8))),
          ]),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
          child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                  value: done / _tasks.length,
                  minHeight: 6,
                  color: const Color(0xfff590b8),
                  backgroundColor: const Color(0x18000000))),
        ),
        for (final slot in ['Mañana', 'Tarde', 'Noche']) _taskGroup(slot),
        const SizedBox(height: 12),
      ],
    );
  }

  Widget _padded(Widget child) =>
      Padding(padding: const EdgeInsets.fromLTRB(20, 0, 20, 15), child: child);

  Widget _moodCard() => _whiteCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('¿Cómo estás hoy?',
                style: TextStyle(
                    fontWeight: FontWeight.w800, fontSize: 14, color: _ink)),
            TextButton(
                onPressed: () => setState(() => _tab = 3),
                style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                child: const Text('Ver más →',
                    style: TextStyle(
                        color: Color(0xfff590b8),
                        fontSize: 11,
                        fontWeight: FontWeight.w700))),
          ]),
          const SizedBox(height: 9),
          Row(children: [
            for (final mood in _moods) Expanded(child: _moodButton(mood))
          ]),
          if (_mood != null)
            Padding(
                padding: const EdgeInsets.only(top: 9),
                child: Center(
                    child: Text(
                        'Estado guardado: $_mood · toca «Ver más» para añadir una nota',
                        style: const TextStyle(fontSize: 11, color: _muted)))),
        ]),
      );

  Widget _moodButton(_Mood mood) {
    final active = _mood == mood.name;
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () => setState(() => _mood = mood.name),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 2),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 2),
        decoration: BoxDecoration(
            color:
                active ? mood.color.withValues(alpha: .13) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: active ? mood.color : Colors.transparent, width: 1.5)),
        child: Column(children: [
          Text(mood.face, style: const TextStyle(fontSize: 21)),
          const SizedBox(height: 3),
          Text(mood.name,
              maxLines: 1,
              style: TextStyle(
                  fontSize: 9,
                  color: active ? mood.color : _muted,
                  fontWeight: FontWeight.w700))
        ]),
      ),
    );
  }

  Widget _mapCard() => Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => setState(() => _showDevice = true),
          child: SizedBox(
            height: 112,
            child: Stack(fit: StackFit.expand, children: [
              CustomPaint(painter: _MapPainter()),
              Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  margin: const EdgeInsets.fromLTRB(11, 0, 11, 10),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: .94),
                      borderRadius: BorderRadius.circular(11)),
                  child: Row(children: [
                    const Icon(Icons.location_on_rounded,
                        color: Color(0xff7098f5), size: 18),
                    const SizedBox(width: 4),
                    Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          Text('${_profile.name} · ${_profile.battery}%',
                              style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: _ink)),
                          Text(
                              '${_profile.deviceName} · actualizado hace 1 min',
                              style:
                                  const TextStyle(fontSize: 10, color: _muted))
                        ])),
                    const Text('Ver mapa →',
                        style: TextStyle(
                            fontSize: 11,
                            color: Color(0xff7098f5),
                            fontWeight: FontWeight.w700)),
                  ]),
                ),
              ),
            ]),
          ),
        ),
      );

  Widget _taskGroup(String slot) {
    final tasks = switch (slot) {
      'Mañana' => _tasks.take(5).toList(),
      'Tarde' => _tasks.skip(5).take(2).toList(),
      _ => _tasks.skip(7).toList(),
    };
    if (tasks.isEmpty) return const SizedBox.shrink();
    final emoji = slot == 'Mañana'
        ? '🌅'
        : slot == 'Tarde'
            ? '☀️'
            : '🌙';
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
            padding: const EdgeInsets.only(bottom: 7),
            child: Text('$emoji  $slot',
                style: const TextStyle(
                    color: _muted,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                    letterSpacing: .5))),
        for (final task in tasks) _taskTile(task),
      ]),
    );
  }

  Widget _taskTile(_Task task) => Padding(
        padding: const EdgeInsets.only(bottom: 7),
        child: Material(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () => setState(() => task.done = !task.done),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
              child: Row(children: [
                Container(
                    width: 21,
                    height: 21,
                    decoration: BoxDecoration(
                        color: task.done ? task.color : Colors.transparent,
                        borderRadius: BorderRadius.circular(7),
                        border: Border.all(
                            color: task.done
                                ? task.color
                                : const Color(0x44000000),
                            width: 1.7)),
                    child: task.done
                        ? const Icon(Icons.check, size: 15, color: Colors.white)
                        : null),
                const SizedBox(width: 12),
                Expanded(
                    child: Text(task.title,
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: _ink,
                            decoration: task.done
                                ? TextDecoration.lineThrough
                                : null))),
                Text(task.time,
                    style: const TextStyle(fontSize: 11, color: _muted)),
                const SizedBox(width: 8),
                if (!task.done)
                  Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                          color: task.color, shape: BoxShape.circle)),
              ]),
            ),
          ),
        ),
      );

  Widget _routinePage(Color accent, Color background) => _scrollPage(
        key: const ValueKey('routines'),
        accent: accent,
        background: background,
        title: 'Mis Rutinas',
        subtitle: 'Pequeños hábitos, grandes cambios.',
        children: [
          _whiteCard(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                const Text('Progreso de hoy',
                    style: TextStyle(color: _muted, fontSize: 12)),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                    value: _tasks.where((t) => t.done).length / _tasks.length,
                    color: accent,
                    backgroundColor: accent.withValues(alpha: .13),
                    minHeight: 8,
                    borderRadius: BorderRadius.circular(8)),
                const SizedBox(height: 7),
                Text(
                    '${_tasks.where((t) => t.done).length}/${_tasks.length} completadas',
                    style: TextStyle(
                        color: accent,
                        fontSize: 12,
                        fontWeight: FontWeight.w700)),
              ])),
          for (final group in ['Mañana', 'Tarde', 'Noche']) ...[
            Padding(
                padding: const EdgeInsets.fromLTRB(2, 8, 2, 8),
                child: Text(group,
                    style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                        color: _ink))),
            for (final task in (group == 'Mañana'
                ? _tasks.take(5)
                : group == 'Tarde'
                    ? _tasks.skip(5).take(2)
                    : _tasks.skip(7)))
              _taskTile(task),
          ],
          const SizedBox(height: 14),
        ],
      );

  Widget _calendarPage(Color accent, Color background) => _scrollPage(
        key: const ValueKey('calendar'),
        accent: accent,
        background: background,
        title: 'Agosto 2026',
        subtitle: 'Organiza tu semana, a tu ritmo.',
        children: [
          _whiteCard(
              child: Column(children: [
            Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: ['L', 'M', 'X', 'J', 'V', 'S', 'D']
                    .map((day) => SizedBox(
                        width: 30,
                        child: Center(
                            child: Text(day,
                                style: const TextStyle(
                                    color: _muted,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 11)))))
                    .toList()),
            const SizedBox(height: 12),
            for (final week in const [
              [null, null, null, null, null, 1, 2],
              [3, 4, 5, 6, 7, 8, 9],
              [10, 11, 12, 13, 14, 15, 16],
              [17, 18, 19, 20, 21, 22, 23],
              [24, 25, 26, 27, 28, 29, 30],
              [31, null, null, null, null, null, null]
            ])
              Padding(
                  padding: const EdgeInsets.only(bottom: 7),
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: week.map((day) {
                        final selected = day == 10;
                        return SizedBox(
                            width: 34,
                            height: 34,
                            child: day == null
                                ? const SizedBox.shrink()
                                : InkWell(
                                    onTap: () {},
                                    borderRadius: BorderRadius.circular(18),
                                    child: Container(
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                            color: selected
                                                ? accent
                                                : Colors.transparent,
                                            shape: BoxShape.circle),
                                        child: Text('$day',
                                            style: TextStyle(
                                                color: selected
                                                    ? Colors.white
                                                    : _ink,
                                                fontWeight: selected
                                                    ? FontWeight.w800
                                                    : FontWeight.w500)))));
                      }).toList())),
          ])),
          const Padding(
              padding: EdgeInsets.fromLTRB(2, 10, 2, 8),
              child: Text('Lunes, 10 de agosto',
                  style: TextStyle(
                      fontWeight: FontWeight.w800, fontSize: 16, color: _ink))),
          for (final event in const [
            ('06:30', 'Carrera HIIT', Color(0xfff590b8), '35 min'),
            (
              '12:00',
              'Paseo a la hora de almuerzo',
              Color(0xfff5a84b),
              '20 min'
            ),
            ('19:00', 'Yoga nocturno', Color(0xffa882f5), '25 min')
          ])
            _eventTile(event.$1, event.$2, event.$3, event.$4),
          const SizedBox(height: 20),
        ],
      );

  Widget _emotionPage(Color accent, Color background) => _scrollPage(
        key: const ValueKey('emotions'),
        accent: accent,
        background: background,
        title: 'Estado emocional',
        subtitle: '¿Cómo te encuentras hoy?',
        children: [
          GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 3,
              crossAxisSpacing: 9,
              mainAxisSpacing: 9,
              childAspectRatio: 1.24,
              children: [
                for (final mood in [
                  ..._moods,
                  const _Mood('😤', 'Estresado', Color(0xfff590b8))
                ])
                  _emotionChoice(mood),
              ]),
          const Padding(
              padding: EdgeInsets.fromLTRB(2, 18, 2, 9),
              child: Text('¿Qué más sientes?',
                  style: TextStyle(
                      fontSize: 14, fontWeight: FontWeight.w800, color: _ink))),
          Wrap(
              spacing: 7,
              runSpacing: 7,
              children: [
                'Motivado',
                'Energizado',
                'Tranquilo',
                'Ansioso',
                'Concentrado',
                'Dolorido',
                'Relajado',
                'Orgulloso'
              ]
                  .map((tag) => FilterChip(
                      label: Text(tag),
                      selected: _tags.contains(tag),
                      onSelected: (value) => setState(
                          () => value ? _tags.add(tag) : _tags.remove(tag)),
                      selectedColor: accent.withValues(alpha: .18)))
                  .toList()),
          const Padding(
              padding: EdgeInsets.fromLTRB(2, 18, 2, 8),
              child: Text('¿Quieres contarnos algo más?',
                  style: TextStyle(
                      fontSize: 14, fontWeight: FontWeight.w800, color: _ink))),
          TextField(
              minLines: 3,
              maxLines: 4,
              onChanged: (text) => _note = text,
              decoration: InputDecoration(
                  hintText: 'Escribe una nota…',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: BorderSide.none))),
          const Padding(
              padding: EdgeInsets.fromLTRB(2, 18, 2, 9),
              child: Text('Esta semana',
                  style: TextStyle(
                      fontSize: 14, fontWeight: FontWeight.w800, color: _ink))),
          _whiteCard(
              child: SizedBox(
                  height: 100,
                  child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        for (int i = 0; i < 7; i++)
                          Expanded(
                              child: Column(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                Container(
                                    height: [52, 63, 42, 69, 56, 66, 72][i]
                                        .toDouble(),
                                    width: 22,
                                    decoration: BoxDecoration(
                                        color: [
                                          const Color(0xfff590b8),
                                          const Color(0xfff5a84b),
                                          const Color(0xffa882f5),
                                          const Color(0xff5ecfa8),
                                          const Color(0xff5bb8f5),
                                          const Color(0xfff5795a),
                                          const Color(0xff5ecfa8)
                                        ][i]
                                            .withValues(
                                                alpha: i == 6 ? 1 : .65),
                                        borderRadius:
                                            BorderRadius.circular(5))),
                                const SizedBox(height: 5),
                                Text(['L', 'M', 'X', 'J', 'V', 'S', 'D'][i],
                                    style: const TextStyle(
                                        fontSize: 10, color: _muted))
                              ]))
                      ]))),
          const SizedBox(height: 12),
          FilledButton(
              onPressed: () {
                setState(() => _savedMood = _mood);
                _message('Registro guardado');
              },
              style: FilledButton.styleFrom(
                  backgroundColor: accent,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15))),
              child: const Text('Guardar registro',
                  style: TextStyle(fontWeight: FontWeight.w800))),
          if (_savedMood != null)
            Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                    'Último registro: $_savedMood${_note.isEmpty ? '' : ' · $_note'}',
                    style: const TextStyle(color: _muted, fontSize: 12))),
          const SizedBox(height: 20),
        ],
      );

  Widget _emotionChoice(_Mood mood) {
    final active = _mood == mood.name;
    return InkWell(
        onTap: () => setState(() => _mood = mood.name),
        borderRadius: BorderRadius.circular(16),
        child: Container(
            decoration: BoxDecoration(
                color:
                    active ? mood.color.withValues(alpha: .13) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: active ? mood.color : const Color(0x10000000),
                    width: active ? 2 : 1)),
            child:
                Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text(mood.face, style: const TextStyle(fontSize: 25)),
              const SizedBox(height: 5),
              Text(mood.name,
                  style: TextStyle(
                      fontSize: 11,
                      color: active ? mood.color : _ink,
                      fontWeight: FontWeight.w700))
            ])));
  }

  Widget _settingsPage(Color accent, Color background) =>
      this._enhancedSettingsPage(accent, background);

  Widget _legacySettingsPage(Color accent, Color background) => _scrollPage(
        key: const ValueKey('settings-old'),
        accent: accent,
        background: background,
        title: 'Configuración',
        subtitle: 'Tu cuenta y tus dispositivos MOVA',
        children: [
          _whiteCard(
              child: Row(children: [
            Container(
                width: 52,
                height: 52,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                        colors: [accent, const Color(0xfff590b8)])),
                child: const Text('C',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 22))),
            const SizedBox(width: 13),
            const Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text('Carlos Rodríguez',
                      style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: _ink,
                          fontSize: 16)),
                  SizedBox(height: 3),
                  Text('12 años · carlos@email.com',
                      style: TextStyle(color: _muted, fontSize: 12))
                ])),
            Icon(Icons.chevron_right, color: accent)
          ])),
          const Padding(
              padding: EdgeInsets.fromLTRB(2, 18, 2, 9),
              child: Text('CUENTA',
                  style: TextStyle(
                      color: _muted,
                      fontSize: 11,
                      letterSpacing: 1.2,
                      fontWeight: FontWeight.w800))),
          _settingsGroup([
            _settingsRow(Icons.person_outline, 'Perfil de usuario',
                'Carlos Rodríguez', accent),
            _settingsRow(Icons.notifications_none, 'Notificaciones',
                'Configura tus alertas', accent)
          ]),
          const Padding(
              padding: EdgeInsets.fromLTRB(2, 18, 2, 9),
              child: Text('CONEXIONES',
                  style: TextStyle(
                      color: _muted,
                      fontSize: 11,
                      letterSpacing: 1.2,
                      fontWeight: FontWeight.w800))),
          _settingsGroup([
            ListTile(
                leading: _settingIcon(Icons.watch_outlined, accent),
                title: const Text('Dispositivo MOVA',
                    style:
                        TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                subtitle: Text(_deviceLabel,
                    style: const TextStyle(fontSize: 11, color: _muted)),
                trailing:
                    const Icon(Icons.chevron_right, color: Color(0xffbdb8d4)),
                onTap: _scan),
            if (_bpm != null)
              ListTile(
                  leading: _settingIcon(Icons.favorite_border, accent),
                  title: const Text('Frecuencia cardíaca'),
                  trailing: Text('$_bpm bpm',
                      style: TextStyle(
                          color: accent, fontWeight: FontWeight.w800))),
          ]),
          Padding(
              padding: const EdgeInsets.only(top: 20),
              child: Center(
                  child: Text('$_syncLabel\nMOVA v2.4.1 - Build 2026.08',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                          color: Color(0xffbdb8d4),
                          fontSize: 11,
                          height: 1.8)))),
        ],
      );

  Widget _settingsRow(
          IconData icon, String title, String subtitle, Color accent) =>
      ListTile(
          leading: _settingIcon(icon, accent),
          title: Text(title,
              style:
                  const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          subtitle: Text(subtitle,
              style: const TextStyle(fontSize: 11, color: _muted)),
          trailing: const Icon(Icons.chevron_right, color: Color(0xffbdb8d4)));
  Widget _settingIcon(IconData icon, Color color) => Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
          color: color.withValues(alpha: .12),
          borderRadius: BorderRadius.circular(11)),
      child: Icon(icon, size: 19, color: color));
  Widget _settingsGroup(List<Widget> children) => Container(
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: const [
            BoxShadow(
                color: Color(0x10000000), blurRadius: 12, offset: Offset(0, 3))
          ]),
      child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(18),
          clipBehavior: Clip.antiAlias,
          child: Column(children: children)));

  Widget _devicePage(Color accent, Color background) =>
      Column(key: const ValueKey('device'), children: [
        Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 18, 14),
            child: Row(children: [
              IconButton(
                  onPressed: () => setState(() => _showDevice = false),
                  icon: const Icon(Icons.arrow_back)),
              const SizedBox(width: 4),
              const Text('Dispositivo MOVA',
                  style: TextStyle(
                      fontSize: 20, fontWeight: FontWeight.w800, color: _ink))
            ])),
        Expanded(
            child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
              Container(
                  height: 225,
                  decoration: BoxDecoration(
                      color: const Color(0xffedf5ff),
                      borderRadius: BorderRadius.circular(22)),
                  child: CustomPaint(
                      painter: _MapPainter(),
                      child: const Center(
                          child: Icon(Icons.location_on_rounded,
                              color: Color(0xff7098f5), size: 42)))),
              const SizedBox(height: 15),
              _whiteCard(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(_profile.deviceName,
                        style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 18,
                            color: _ink)),
                    const SizedBox(height: 4),
                    Text('${_profile.name} · Actualizado hace 1 min',
                        style: const TextStyle(color: _muted, fontSize: 12)),
                    const Divider(height: 24),
                    _dataRow('Batería', '${_profile.battery}%', accent),
                    _dataRow('Conexión', _deviceLabel, accent),
                    _dataRow('Pasos sincronizados', _profile.steps.toString(),
                        accent),
                    if (_bpm != null)
                      _dataRow('Frecuencia cardíaca', '$_bpm bpm', accent)
                  ])),
              const SizedBox(height: 12),
              FilledButton.icon(
                  onPressed: _scanning ? null : _scan,
                  icon: const Icon(Icons.bluetooth_searching),
                  label: Text(_scanning ? 'Buscando…' : 'Buscar wearable'),
                  style: FilledButton.styleFrom(
                      backgroundColor: accent,
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15)))),
              for (final result in _found)
                ListTile(
                    title: Text(result.device.platformName.isEmpty
                        ? result.device.remoteId.str
                        : result.device.platformName),
                    subtitle: const Text('Dispositivo cercano'),
                    trailing: const Icon(Icons.bluetooth),
                    onTap: () => _connect(result.device)),
              const SizedBox(height: 20),
            ])),
      ]);

  Widget _dataRow(String label, String value, Color accent) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: const TextStyle(fontSize: 12, color: _muted)),
        Flexible(
            child: Text(value,
                textAlign: TextAlign.right,
                style: TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w700, color: accent)))
      ]));

  Widget _scrollPage(
          {required Key key,
          required Color accent,
          required Color background,
          required String title,
          required String subtitle,
          required List<Widget> children}) =>
      ListView(key: key, padding: EdgeInsets.zero, children: [
        Container(
            padding: const EdgeInsets.fromLTRB(20, 28, 20, 18),
            decoration: BoxDecoration(
                gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [accent.withValues(alpha: .2), background])),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title,
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.w900, color: _ink)),
              const SizedBox(height: 3),
              Text(subtitle,
                  style: TextStyle(
                      fontSize: 13, color: accent.withValues(alpha: .9)))
            ])),
        const SizedBox(height: 17),
        Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 22),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: children)),
      ]);

  Widget _whiteCard(
          {required Widget child,
          EdgeInsets padding = const EdgeInsets.all(15)}) =>
      Container(
          padding: padding,
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(
                    color: Color(0x10000000),
                    blurRadius: 12,
                    offset: Offset(0, 3))
              ]),
          child: child);

  Widget _eventTile(String time, String title, Color color, String duration) =>
      Container(
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border(left: BorderSide(color: color, width: 4))),
          child: ListTile(
              dense: true,
              title: Text(title,
                  style: const TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w700, color: _ink)),
              subtitle: Text('$time · $duration',
                  style: const TextStyle(fontSize: 11, color: _muted)),
              trailing: Icon(Icons.chevron_right, color: color)));

  Future<void> _notifications() async {
    await showModalBottomSheet<void>(
        context: context,
        backgroundColor: Colors.white,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        builder: (context) => SafeArea(
            child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 25),
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
                      for (final item in const [
                        (
                          '⚽',
                          'Taller de fútbol en 45 min',
                          '15:15',
                          Color(0xff5ecfa8)
                        ),
                        (
                          '💧',
                          'Recuerda hidratarte',
                          '12:00',
                          Color(0xff6b9fff)
                        ),
                        (
                          '🌙',
                          'Hora de dormir a las 21:30',
                          '21:00',
                          Color(0xff9b72f5)
                        )
                      ])
                        ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: Text(item.$1,
                                style: const TextStyle(fontSize: 22)),
                            title: Text(item.$2,
                                style:
                                    const TextStyle(fontSize: 13, color: _ink)),
                            trailing: Text(item.$3,
                                style: const TextStyle(
                                    fontSize: 11, color: _muted)))
                    ]))));
  }
}

class _MapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(
        Offset.zero & size, Paint()..color = const Color(0xffedf5ff));
    final grid = Paint()
      ..color = const Color(0xff7098f5).withValues(alpha: .16)
      ..strokeWidth = 1;
    for (double x = 0; x < size.width; x += 22) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), grid);
    }
    for (double y = 0; y < size.height; y += 22) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    }
    final route = Path()
      ..moveTo(size.width * .1, size.height * .72)
      ..quadraticBezierTo(size.width * .35, size.height * .6, size.width * .48,
          size.height * .63)
      ..quadraticBezierTo(size.width * .69, size.height * .67, size.width * .88,
          size.height * .34);
    canvas.drawPath(
        route,
        Paint()
          ..color = const Color(0xff7098f5)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.4
          ..strokeCap = StrokeCap.round);
    canvas.drawCircle(Offset(size.width * .1, size.height * .72), 4,
        Paint()..color = const Color(0xff7098f5));
    canvas.drawCircle(Offset(size.width * .88, size.height * .34), 8,
        Paint()..color = const Color(0xff7098f5).withValues(alpha: .4));
    canvas.drawCircle(Offset(size.width * .88, size.height * .34), 4,
        Paint()..color = const Color(0xff7098f5));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

extension _SettingsUi on _MovaShellState {
  Widget _enhancedSettingsPage(Color accent, Color background) => _scrollPage(
        key: const ValueKey('settings'),
        accent: accent,
        background: background,
        title: 'Configuración',
        subtitle: 'Tu cuenta y tus dispositivos MOVA',
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Perfiles',
                style: TextStyle(
                    color: _ink, fontSize: 14, fontWeight: FontWeight.w800)),
            TextButton.icon(
                onPressed: _addProfile,
                icon: const Icon(Icons.add, size: 17),
                label: const Text('Perfil'),
                style: TextButton.styleFrom(foregroundColor: accent)),
          ]),
          SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [
                for (final profile in _profiles)
                  Padding(
                      padding: const EdgeInsets.only(right: 7),
                      child: ChoiceChip(
                        label: Text(profile.name),
                        selected: profile.id == _activeProfileId,
                        selectedColor: accent.withValues(alpha: .2),
                        onSelected: (_) async {
                          setState(() => _activeProfileId = profile.id);
                          await _savePreferences();
                        },
                      )),
              ])),
          const SizedBox(height: 10),
          InkWell(
              onTap: _editProfile,
              borderRadius: BorderRadius.circular(20),
              child: _whiteCard(
                  child: Row(children: [
                Container(
                    width: 52,
                    height: 52,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                            colors: [accent, const Color(0xfff590b8)])),
                    child: _profile.photo.isEmpty
                        ? Text(
                            _profile.name.isEmpty
                                ? 'U'
                                : _profile.name[0].toUpperCase(),
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 22))
                        : ClipOval(
                            child: Image.memory(base64Decode(_profile.photo),
                                width: 52, height: 52, fit: BoxFit.cover))),
                const SizedBox(width: 13),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text(_profile.name,
                          style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              color: _ink,
                              fontSize: 16)),
                      const SizedBox(height: 3),
                      Text(
                          '${widget.adultName} | ${_profile.name} (${_profile.age}) | ${_profile.email}',
                          style: const TextStyle(color: _muted, fontSize: 12))
                    ])),
                Icon(Icons.edit_outlined, color: accent),
              ]))),
          _settingsSection('CUENTA'),
          _settingsGroup([
            _settingsItem(Icons.person_outline, 'Perfil de usuario',
                'Editar datos personales', accent, _editProfile),
            _settingsItem(
                Icons.notifications_none,
                'Notificaciones',
                _alertsExpanded ? 'Alertas de MOVA Kids' : 'Activadas',
                accent,
                () => setState(() => _alertsExpanded = !_alertsExpanded)),
            if (_alertsExpanded)
              Padding(
                  padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
                  child: Column(children: [
                    _settingsSwitch(
                        'Vibración',
                        _profile.vibration,
                        (value) => _updateProfile(
                            (profile) => profile.vibration = value)),
                    _settingsSwitch(
                        'Sonido',
                        _profile.sound,
                        (value) =>
                            _updateProfile((profile) => profile.sound = value)),
                    _settingsSwitch(
                        'Luces',
                        _profile.lights,
                        (value) => _updateProfile(
                            (profile) => profile.lights = value)),
                    Opacity(
                        opacity: _profile.vibration ? 1 : .45,
                        child: Column(children: [
                          Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Intensidad de vibración',
                                    style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: _ink)),
                                Text('${_profile.intensity}/10',
                                    style: TextStyle(
                                        color: accent,
                                        fontWeight: FontWeight.w900,
                                        fontSize: 12))
                              ]),
                          Slider(
                              value: _profile.intensity.toDouble(),
                              min: 1,
                              max: 10,
                              divisions: 9,
                              activeColor: accent,
                              onChanged: _profile.vibration
                                  ? (value) => _updateProfile((profile) =>
                                      profile.intensity = value.round())
                                  : null),
                          const Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Suave',
                                    style:
                                        TextStyle(fontSize: 9, color: _muted)),
                                Text('Intensa',
                                    style:
                                        TextStyle(fontSize: 9, color: _muted))
                              ]),
                        ])),
                  ])),
            _settingsItem(
                Icons.lock_outline,
                'Privacidad y seguridad',
                'Permisos y datos',
                accent,
                () => setState(() => _privacyExpanded = !_privacyExpanded)),
            if (_privacyExpanded)
              const Padding(
                  padding: EdgeInsets.fromLTRB(16, 0, 16, 14),
                  child: Text(
                      'El perfil y las preferencias se guardan localmente en este dispositivo. Los datos del wearable se envían a la API cuando sincronizas.',
                      style: TextStyle(
                          fontSize: 11, height: 1.45, color: _muted))),
          ]),
          _settingsSection('APLICACIÓN'),
          _settingsGroup([
            _settingsItem(
                Icons.language, 'Idioma', _language, accent, _changeLanguage)
          ]),
          _settingsSection('CONEXIONES'),
          _settingsGroup([
            _settingsItem(
                Icons.watch_outlined,
                'Dispositivo MOVA',
                _deviceExpanded
                    ? _profile.deviceName
                    : '${_profile.deviceName} · ${_profile.battery}%',
                accent,
                () => setState(() => _deviceExpanded = !_deviceExpanded)),
            if (_deviceExpanded)
              Padding(
                  padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          Icon(Icons.watch, color: accent),
                          const SizedBox(width: 9),
                          Expanded(
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                Text(_profile.deviceName,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: _ink,
                                        fontSize: 13)),
                                Text(
                                    _deviceLabel == 'Sin dispositivo conectado'
                                        ? 'Conectado · Batería ${_profile.battery}%'
                                        : _deviceLabel,
                                    style: const TextStyle(
                                        color: Color(0xff36a77f),
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700))
                              ]))
                        ]),
                        const SizedBox(height: 8),
                        _dataRow('Usuario sincronizado', _profile.name, accent),
                        _dataRow('Teléfono', '+569 ${_profile.phone}', accent),
                        _dataRow(
                            'Número de dispositivo', _profile.deviceId, accent),
                        _dataRow('Pasos sincronizados',
                            _profile.steps.toString(), accent),
                        const SizedBox(height: 8),
                        Align(
                            alignment: Alignment.centerLeft,
                            child: FilledButton.icon(
                                onPressed: _scanning ? null : _scan,
                                icon: const Icon(Icons.bluetooth_searching,
                                    size: 17),
                                label: Text(_scanning
                                    ? 'Buscando…'
                                    : 'Buscar wearables'),
                                style: FilledButton.styleFrom(
                                    backgroundColor: accent))),
                        for (final result in _found)
                          ListTile(
                              dense: true,
                              title: Text(result.device.platformName.isEmpty
                                  ? result.device.remoteId.str
                                  : result.device.platformName),
                              trailing: const Icon(Icons.bluetooth),
                              onTap: () => _connect(result.device)),
                      ])),
            _settingsItem(
                Icons.link,
                'Redes sociales',
                'Instagram conectado',
                accent,
                () => _infoDialog('Redes sociales',
                    'La conexión con redes sociales no está habilitada en esta versión de demostración.')),
          ]),
          _settingsSection('SOPORTE'),
          _settingsGroup([
            _settingsItem(
                Icons.chat_bubble_outline,
                'Centro de ayuda',
                '',
                accent,
                () => _infoDialog('Centro de ayuda',
                    'Para conectar el wearable, activa Bluetooth y acércalo al teléfono.')),
            _settingsItem(Icons.star_outline, 'Valorar MOVA', '', accent,
                () => _message('¡Gracias por probar MOVA!')),
            _settingsItem(
                Icons.description_outlined,
                'Términos y privacidad',
                '',
                accent,
                () => _infoDialog('Términos y privacidad',
                    'La cuenta y el inicio de sesion se validan en el servidor MOVA.')),
          ]),
          const SizedBox(height: 16),
          SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                  onPressed: widget.onLogout,
                  icon: const Icon(Icons.logout),
                  label: const Text('Cerrar sesión'),
                  style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xfff5795a),
                      side: const BorderSide(color: Color(0x55f5795a)),
                      backgroundColor: const Color(0x14f5795a),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14))))),
          const Padding(
              padding: EdgeInsets.only(top: 14),
              child: Center(
                  child: Text('MOVA v2.4.1 · Build 2026.08',
                      style:
                          TextStyle(color: Color(0xffbdb8d4), fontSize: 11)))),
        ],
      );

  Widget _settingsSection(String title) => Padding(
      padding: const EdgeInsets.fromLTRB(2, 19, 2, 9),
      child: Text(title,
          style: const TextStyle(
              color: _muted,
              fontSize: 11,
              letterSpacing: 1.3,
              fontWeight: FontWeight.w800)));

  Widget _settingsItem(IconData icon, String title, String subtitle,
          Color accent, VoidCallback onTap) =>
      ListTile(
          leading: _settingIcon(icon, accent),
          title: Text(title,
              style:
                  const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          subtitle: subtitle.isEmpty
              ? null
              : Text(subtitle,
                  style: const TextStyle(fontSize: 10, color: _muted)),
          trailing: const Icon(Icons.chevron_right, color: Color(0xffbdb8d4)),
          onTap: onTap,
          dense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14));

  Widget _settingsSwitch(
          String label, bool value, ValueChanged<bool> onChanged) =>
      SwitchListTile.adaptive(
          contentPadding: EdgeInsets.zero,
          dense: true,
          title: Text(label,
              style: const TextStyle(
                  color: _ink, fontSize: 12, fontWeight: FontWeight.w700)),
          value: value,
          activeColor: const Color(0xff5ecfa8),
          onChanged: onChanged);

  void _updateProfile(void Function(_Profile profile) update) {
    setState(() => update(_profile));
    _savePreferences();
  }
}
