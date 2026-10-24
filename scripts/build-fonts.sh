#!/bin/bash
# Сборка шрифтов: один файл на семейство (кириллица + базовая латиница, цифры, пунктуация, ₽, №).
# Нужны fonttools и brotli: pip install fonttools brotli. Запуск из корня репозитория.
set -euo pipefail
T="$(mktemp -d)"
trap 'rm -rf -- "$T"' EXIT
curl -sL -o "$T/golos.ttf" "https://github.com/google/fonts/raw/main/ofl/golostext/GolosText%5Bwght%5D.ttf"
curl -sL -o "$T/serif.ttf" "https://github.com/google/fonts/raw/main/ofl/sourceserif4/SourceSerif4%5Bopsz%2Cwght%5D.ttf"
U="U+0020-007E,U+00A0-00BB,U+00D7,U+0301,U+0401,U+0410-044F,U+0451,U+2010-2014,U+2018-201E,U+2022,U+2026,U+2116,U+20BD,U+2190-2193,U+2212"
F='kern,liga,calt,lnum,pnum,tnum'
fonttools varLib.instancer "$T/serif.ttf" wght=400:700 opsz=20 -o "$T/serif-i.ttf" -q
fonttools varLib.instancer "$T/golos.ttf" wght=400:700 -o "$T/golos-i.ttf" -q
pyftsubset "$T/serif-i.ttf" --unicodes="$U" --flavor=woff2 --layout-features=$F --output-file=public/fonts/serif4-ru.woff2
pyftsubset "$T/golos-i.ttf" --unicodes="$U" --flavor=woff2 --layout-features=$F --output-file=public/fonts/golos-ru.woff2
