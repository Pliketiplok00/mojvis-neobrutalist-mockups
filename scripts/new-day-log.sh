#!/bin/bash

# ===========================================
# MOJ VIS - New Day Log Script
# Dodaje prazan template za danasnji dan u HANDOVER_LOG.md
# ===========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/docs/HANDOVER_LOG.md"

DATE=$(date +%Y-%m-%d)
DAY_NAME=$(LC_TIME=hr_HR.UTF-8 date +%A 2>/dev/null || date +%A)

# Provjeri postoji li log file
if [ ! -f "$LOG_FILE" ]; then
  echo "❌ HANDOVER_LOG.md ne postoji!"
  echo "   Ocekivana lokacija: $LOG_FILE"
  exit 1
fi

# Provjeri postoji li vec danasnji datum
if grep -q "### $DATE" "$LOG_FILE"; then
  echo "✅ Danasnji log vec postoji ($DATE)"
  echo "📝 Otvori docs/HANDOVER_LOG.md i nastavi biljeziti"
  exit 0
fi

# Pronadi liniju "## Kronologija" i dodaj nakon nje
# Koristi perl za cross-platform kompatibilnost
perl -i -pe "
  if (/^## Kronologija/) {
    \$_ .= \"\n### $DATE ($DAY_NAME)\n\n#### Sto je odradeno danas\n- \n\n#### Odluke donesene\n- \n\n#### Problemi/blockeri\n- Nema\n\n---\n\";
  }
" "$LOG_FILE"

echo "✅ Dodan template za $DATE ($DAY_NAME)"
echo ""
echo "📝 Otvori docs/HANDOVER_LOG.md i popuni tijekom dana"
echo "   Lokacija: $LOG_FILE"
