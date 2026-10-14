import 'package:flutter_test/flutter_test.dart';
import 'package:mova/map_navigation.dart';

void main() {
  test('enlaces externos mantienen exactamente la posición del marcador', () {
    for (final destination in MapDestination.values) {
      final uri = mapNavigationUrl(destination, -33.4489, -70.6693);
      expect(uri.scheme, 'https');
      expect(
          uri.queryParameters[
              destination == MapDestination.google ? 'query' : 'll'],
          '-33.4489,-70.6693');
    }
    expect(mapNavigationUrl(MapDestination.google, 0, 0).queryParameters['api'],
        '1');
    expect(nativeMapNavigationUrl(MapDestination.google, 0, 0)?.scheme,
        'comgooglemaps');
    expect(nativeMapNavigationUrl(MapDestination.waze, 0, 0)?.scheme, 'waze');
    expect(() => mapNavigationUrl(MapDestination.apple, 91, 0),
        throwsArgumentError);
  });
}
