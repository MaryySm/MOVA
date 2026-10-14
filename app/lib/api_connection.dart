import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

const defaultMovaApiUrl = String.fromEnvironment('MOVA_API_URL',
    defaultValue: kIsWeb
        ? 'http://localhost:3000'
        : 'http://MacBook-Air-de-Erick.local:3000');

class ApiConnection {
  static String url = defaultMovaApiUrl;
  static String normalize(String input) {
    final uri = Uri.tryParse(input.trim());
    if (uri == null ||
        !['http', 'https'].contains(uri.scheme) ||
        uri.host.isEmpty ||
        uri.userInfo.isNotEmpty ||
        uri.hasQuery ||
        uri.hasFragment ||
        (uri.path.isNotEmpty && uri.path != '/')) {
      throw const FormatException(
          'Ingresa una dirección como http://nombre-del-mac.local:3000');
    }
    return uri.replace(path: '').toString();
  }

  static Future<void> restore() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('mova_api_url');
    url = saved == null ? defaultMovaApiUrl : normalize(saved);
  }

  static Future<String> check(String input, {http.Client? client}) async {
    final target = normalize(input);
    final ownClient = client == null;
    final transport = client ?? http.Client();
    try {
      // Health check never sends session/device credentials to a proposed server.
      final response = await transport
          .get(Uri.parse('$target/health'))
          .timeout(const Duration(seconds: 8));
      if (response.statusCode != 200)
        throw Exception('El servidor no está disponible');
      final data = jsonDecode(response.body);
      if (data is! Map ||
          data['status'] != 'ok' ||
          data['database'] != 'connected') {
        throw Exception('La API o su base de datos no está disponible');
      }
      return target;
    } finally {
      if (ownClient) transport.close();
    }
  }

  static Future<void> save(String input) async {
    final target = normalize(input);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('mova_api_url', target);
    // A changed server requires a fresh login; never reuse a token on another server.
    if (target != url) await prefs.remove('mova_session');
    url = target;
  }
}
