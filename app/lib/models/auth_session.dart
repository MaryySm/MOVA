// Represento los datos que recibo de la API después del registro o login.
class AuthSession {
  const AuthSession({
    required this.token,
    required this.id,
    required this.adultName,
    required this.name,
    required this.age,
    required this.phone,
    required this.email,
  });

  final String token;
  final String id;
  final String adultName;
  final String name;
  final String age;
  final String phone;
  final String email;

  // Convierto el JSON del backend a un objeto que usa la interfaz Flutter.
  factory AuthSession.fromJson(Map<String, dynamic> json, {String token = ''}) {
    final user = json['user'] as Map<String, dynamic>;
    return AuthSession(
      token: token,
      id: user['id'] as String,
      adultName: user['adultName'] as String? ?? '',
      name: user['name'] as String,
      age: user['age'].toString(),
      phone: user['phone'] as String,
      email: user['email'] as String,
    );
  }
}
