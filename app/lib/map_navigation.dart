enum MapDestination { google, apple, waze }

Uri mapNavigationUrl(
    MapDestination destination, double latitude, double longitude) {
  if (!latitude.isFinite ||
      !longitude.isFinite ||
      latitude.abs() > 90 ||
      longitude.abs() > 180) throw ArgumentError('Coordenadas inválidas');
  final coordinates = '$latitude,$longitude';
  return switch (destination) {
    MapDestination.google => Uri.https(
        'www.google.com', '/maps/search/', {'api': '1', 'query': coordinates}),
    MapDestination.apple => Uri.https('maps.apple.com', '/',
        {'ll': coordinates, 'q': 'Ubicación simulada MOVA'}),
    MapDestination.waze =>
      Uri.https('waze.com', '/ul', {'ll': coordinates, 'navigate': 'yes'}),
  };
}

Uri? nativeMapNavigationUrl(
    MapDestination destination, double latitude, double longitude) {
  mapNavigationUrl(destination, latitude, longitude);
  final coordinates = '$latitude,$longitude';
  return switch (destination) {
    MapDestination.google => Uri(
        scheme: 'comgooglemaps', host: '', queryParameters: {'q': coordinates}),
    MapDestination.waze => Uri(
        scheme: 'waze',
        host: '',
        queryParameters: {'ll': coordinates, 'navigate': 'yes'}),
    MapDestination.apple => null,
  };
}
