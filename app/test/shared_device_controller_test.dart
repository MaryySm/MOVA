import 'dart:async';
import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mova/shared_device_controller.dart';

http.Response stateResponse(String mood) => http.Response(jsonEncode({
  'payload': {'mood': mood, 'activities': {'a1': true}, 'sos': false},
  'updatedAt': '2026-10-06T12:00:00Z',
}), 200);

void main() {
  test('una lectura anterior no reemplaza una escritura confirmada', () async {
    final pendingRead = Completer<http.Response>();
    final controller = SharedDeviceController(apiUrl: 'http://localhost:3000', deviceId: 'MOVA-2841', client: MockClient((request) async {
      expect(request.url.path, '/api/devices/MOVA-2841/state');
      if (request.method == 'GET') return pendingRead.future;
      expect(jsonDecode(request.body), {'mood': 'Bien'});
      return stateResponse('Bien');
    }));
    final read = controller.refresh();
    expect(await controller.update({'mood': 'Bien'}), true);
    pendingRead.complete(stateResponse('Triste'));
    await read;
    expect(controller.payload?['mood'], 'Bien');
    controller.dispose();
  });
  test('una escritura fallida conserva los datos y permite reintentar', () async {
    var fail = false;
    final controller = SharedDeviceController(apiUrl: 'http://localhost:3000', deviceId: 'MOVA-2841', client: MockClient((request) async => fail ? http.Response('{}', 503) : stateResponse('Bien')));
    await controller.refresh();
    fail = true;
    expect(await controller.update({'mood': 'Triste'}), false);
    expect(controller.payload?['mood'], 'Bien');
    expect(controller.busy, false);
    expect(controller.status, contains('No se guardó'));
    fail = false;
    expect(await controller.update({'mood': 'Bien'}), true);
    controller.dispose();
  });
}
