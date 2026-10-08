import 'package:flutter/material.dart';

/// Aquí centralizo la paleta compartida por las vistas de la app Flutter.
abstract final class AppTheme {
  static const ink = Color(0xff1a1a2e);
  static const muted = Color(0xff68677e);

  static const sectionColors = <Color>[
    Color(0xfff590b8),
    Color(0xfff5a84b),
    Color(0xffa882f5),
    Color(0xfff5795a),
    Color(0xffc47df5),
  ];

  static const sectionBackgrounds = <Color>[
    Color(0xfffff0f5),
    Color(0xfffff4e6),
    Color(0xfff5f0ff),
    Color(0xfffff5f0),
    Color(0xfff8f0ff),
  ];
}
