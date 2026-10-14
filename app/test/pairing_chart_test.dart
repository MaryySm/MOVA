import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mova/pairing_scanner.dart';
import 'package:mova/emotion_history_panel.dart';

void main() {
  test('QR MOVA mantiene ceros iniciales y rechaza QR ajenos', () {
    expect(movaPairingCode('mova://pair?code=001234'), '001234');
    expect(movaPairingCode('123456'), '123456');
    expect(movaPairingCode('https://malicioso.com/?code=123456'), isNull);
    expect(movaPairingCode('mova://pair?code=12345'), isNull);
  });
  testWidgets(
      'barras accesibles con porcentaje y color estable a ancho de teléfono',
      (tester) async {
    await tester.pumpWidget(const MaterialApp(
        home: Scaffold(
            body: SizedBox(
                width: 300,
                child: EmotionBarChart(emotions: [
                  {'mood': 'Bien', 'percentage': 66.7, 'count': 2},
                  {'mood': 'Triste', 'percentage': 33.3, 'count': 1}
                ])))));
    expect(find.text('66.7%'), findsOneWidget);
    expect(find.text('33.3%'), findsOneWidget);
    expect(find.byType(AnimatedContainer), findsNWidgets(7));
    expect(tester.takeException(), isNull);
  });
}
