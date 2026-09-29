import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/auth_session.dart';

const _apiBaseUrl = String.fromEnvironment(
  'MOVA_API_URL',
  defaultValue: 'http://10.0.2.2:3000',
);

class AuthApiException implements Exception {
  const AuthApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

class AuthApi {
  AuthApi({http.Client? client}) : _client = client ?? http.Client();
  final http.Client _client;
  Uri get _baseUri => Uri.parse(_apiBaseUrl);

  Future<AuthSession> login(
          {required String email, required String password}) =>
      _request('/api/auth/login', {'email': email, 'password': password});

  Future<AuthSession> register({
    required String adultName,
    required String name,
    required String age,
    required String phone,
    required String email,
    required String diagnosis,
    required String password,
  }) =>
      _request('/api/auth/register', {
        'adultName': adultName,
        'name': name,
        'age': age,
        'phone': '+569$phone',
        'email': email,
        'diagnosis': diagnosis,
        'password': password,
      });

  Future<AuthSession> _request(String path, Map<String, dynamic> body) async {
    try {
      final response = await _client
          .post(
            _baseUri.resolve(path),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 15));
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw AuthApiException(
            data['error'] as String? ?? 'No se pudo completar la solicitud.');
      }
      return AuthSession.fromJson(data, token: data['token'] as String? ?? '');
    } on AuthApiException {
      rethrow;
    } on FormatException {
      throw const AuthApiException(
          'El servidor devolvió una respuesta no válida.');
    } catch (_) {
      throw const AuthApiException(
          'No se pudo conectar con MOVA. Revisa la conexión e inténtalo otra vez.');
    }
  }
}
