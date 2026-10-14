import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mova/api_connection.dart';

void main() {
  test('dirección estable local y normalización sin rutas ni credenciales', () {
    expect(ApiConnection.normalize(' http://mi-mac.local:3000/ '),
        'http://mi-mac.local:3000');
    for (final address in [
      'localhost:3000',
      'http://user:password@host:3000',
      'https://host/api',
      'https://host?token=abc',
      'file:///tmp'
    ]) {
      expect(() => ApiConnection.normalize(address), throwsFormatException);
    }
  });
  test('comprobación requiere API y base de datos sin transmitir token',
      () async {
    final client = MockClient((request) async {
      expect(request.url.toString(), 'http://mi-mac.local:3000/health');
      expect(request.headers.containsKey('Authorization'), false);
      return http.Response('{"status":"ok","database":"connected"}', 200);
    });
    expect(
        await ApiConnection.check('http://mi-mac.local:3000', client: client),
        'http://mi-mac.local:3000');
    final bad = MockClient((_) async =>
        http.Response('{"status":"ok","database":"offline"}', 200));
    await expectLater(
        ApiConnection.check('http://mi-mac.local:3000', client: bad),
        throwsException);
  });
  test('servidor se conserva y sesión no se reutiliza al cambiar destino',
      () async {
    SharedPreferences.setMockInitialValues({'mova_session': 'token-de-prueba'});
    ApiConnection.url = 'http://anterior.local:3000';
    await ApiConnection.save('http://nuevo.local:3000');
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('mova_session'), isNull);
    ApiConnection.url = defaultMovaApiUrl;
    await ApiConnection.restore();
    expect(ApiConnection.url, 'http://nuevo.local:3000');
    await prefs.setString('mova_session', 'sesion-mismo-servidor');
    await ApiConnection.save('http://nuevo.local:3000');
    expect(prefs.getString('mova_session'), 'sesion-mismo-servidor');
  });
}
