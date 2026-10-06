import 'package:flutter_test/flutter_test.dart';
import 'package:mova/main.dart';

void main() {
  testWidgets('MOVA muestra la pantalla de inicio de sesión', (tester) async {
    await tester.pumpWidget(const MovaApp());
    await tester.pumpAndSettle();

    expect(find.text('MOVA'), findsOneWidget);
    expect(find.text('Bienvenido'), findsOneWidget);
    expect(find.text('Inicia sesión para continuar'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
