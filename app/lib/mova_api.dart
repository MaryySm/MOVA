import 'dart:convert';
import 'api_connection.dart';
import 'package:http/http.dart' as http;

String get movaApiUrl => ApiConnection.url;

class MovaApi {
  MovaApi(this.token);
  final String token;
  Future<dynamic> request(String method, String path,
      [Map<String, dynamic>? body]) async {
    final request = http.Request(method, Uri.parse('$movaApiUrl$path'));
    request.headers['Content-Type'] = 'application/json';
    if (token.isNotEmpty) request.headers['Authorization'] = 'Bearer $token';
    if (body != null) request.body = jsonEncode(body);
    final response = await request.send().then(http.Response.fromStream)
        .timeout(const Duration(seconds: 12));
    dynamic data;
    if (response.body.isNotEmpty) {
      try {
        data = jsonDecode(response.body);
      } catch (_) {}
    }
    if (response.statusCode >= 400)
      throw Exception(
          data is Map ? data['error'] : 'API ${response.statusCode}');
    return data;
  }

  Future<dynamic> get(String path) => request('GET', path);
  Future<dynamic> post(String path, Map<String, dynamic> body) =>
      request('POST', path, body);
  Future<dynamic> patch(String path, Map<String, dynamic> body) =>
      request('PATCH', path, body);
}
