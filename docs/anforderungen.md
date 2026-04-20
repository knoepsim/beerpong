# Ideen

## Architekturüberlegungen
- Aktuell ist es als next.js only webapp implementiert
- ich frage mich ob das so sinnvoll ist, wenn man nachher ggf. hardware implementieren will (sowas wie displays, livespielstand über sensorik usw.)
- prisma als orm und postgres als datenbank
- monorepo struktur mit yarn? ist sowas hier sinnvoll?
- **Datenhaltung & Historie:** 
  - Fokus auf einen Hybrid-Ansatz aus klassischem CRUD (für schnellen Zugriff auf Tabellen/Stände) und einem Audit-Log (Event-History).
  - Jede ergebnisrelevante Aktion (Meldung, Korrektur, Statusänderung) wird in einer Historien-Tabelle mit Zeitstempel und Verursacher (Actor) geloggt, um Fehlerkorrekturen nachvollziehbar zu machen.
  - Vollständiges Event-Sourcing wird als "overengineered" eingestuft, aber die Event-Logik bereitet den Weg für spätere Hardware-Integrationen (Sensoren-Events).

## Anforderungen Webapp
## Nutzerverwaltung
- Registrieren: jeder soll einen Account erstellen können mit seiner E-Mail als unique identifier. dabei soll social login möglich sein. wenn die email bereits registriert ist (oder mit einem anderen social provider) soll dies als hinweis angezeigt werden.
- Einloggen: Jeder registrierte Nutzer soll sich einloggen können
- Es soll RBAC geben
  - Admin: globale Nutzerverwaltung und gloable Rollenverwaltung, globale Turnierverwaltung
  - Manager: kann Turniere erstellen
  - Ein Nutzer ohne Rolle ist der Standard. Dieser kann sich bei Turnieren anmelden und Partizipieren
- Logout
- Aktuell ist es Passwortlos implementiert - ist das sinnvoll?

## Turniere anlegen & Nutzer einladen
- Alle mit Role Manager und Admin sollen Turniere erstellen können und notwendige einstellungen vornehmen können (auch kosmetische sachen wie startdatum/zeit, titel, max teilnehmer etc.)
- es sollen ggf in zukunft verschiedene turniermodi implementiert werden - hier ist für den anfang ganz klar ein standard turnier mit gruppenphase und dann ko phase sinnvoll.
hier soll der nutzer einstellen wieviele aus der Gruppenphase weiter kommen
- es muss die teamgröße angegeben werden
- Der manager und admin soll einsicht auf eine admin ebene des turniers bekommen
  - dabei soll er Nutzerinfos sehen (inkl Telefonnummer)
  - es soll ein checkin mechanismus geben (nur teams die anwensend sind können am ende auch partizipieren)
  - status einsicht auf nutzer und teams (teamvollständigkeit usw)
  - teams/nutzer aus dem turnier entfernen

## Beitritt zu Turnieren und Spiel
- ein Nutzer soll einem Turnier beitreten können und ein teamname bestimmen
- je nach teamgröße muss er weitere nutzer in sein team einladen. diese sind dann auch teil des turniers

## Turnierverlauf
- verschieden Modi - allerdings erstmal nur Gruppenphase -> KO Phase
- alle Teams die eingechecked sind partizipieren
- es muss eine tischverwaltung geben, sodass eangezeigt werden kann, an welchem Tisch welches Spiel stattfindet
- es muss angezeigt werden welches team welche farbe hat (rot oder blau, gelost - rot fängt immer an)
- Ergebnisse können von Turnierersteller und festgelegten Helfern (Turniersettings, müssen keine Teilnehmer sein aber können Teilnehmer sein) gemeldet werden
  - bei der egebnismeldung braucht es ein react component der das eingegebene ergebnis visualisiert. es müssen die übrigen becher angegeben werden. Bsp. blau hat gewonnen -> damit stehen 0 rote becher, aber es stehen noch 4 blaue becher. -> bedeutet: erst auswahl gewinner, dann eingabe wieviel becher noch stehen auf der anderen seite und das ganze dabei visualisieren (am besten mit einem tisch auf dem die tischnummer steht). die genaue meldung der übrigen becher ist wichtig für die wertung in der gruppe
  - ergebnisse müssen durch die turnierleitung nachträglich änderbar sein (fehlerkorrektur)
- nach der abgeschlossenen gruppenphase muss der turnierersteller bestätigen, dass ale ergebisse korrekt dokumentiert sind und die KO-Phase starten. Hier muss eine sinnvolle und faire verteilung über die KO Phasen spiele stattfinden. 1. Gruppe A vs 2. Gruppe B usw. dass ein anreiz auf den ersten platz existiert
- die nutzer sollen zu jeder zeit sehen wo sie aktuell spiele müssen was ihre nächsten spiele sind und wie die tabellen der einzelnen gruppen aussehen
- in der ko phase soll den teilnehmern der Turnierbaum statt tabellen angezeigt werden


offene fragen:
1. architektur & technologie
für die hardware integration würde es vermutlich sinn machen zu trennen. was hällst du von nextjs mit nestjs als backend - ggf sinnvoll auf mikroorm zu wechseln?
2. social login: die, die aktuell integriert sind: es wird next auth verwendet. ich weiß nicht ob es sinnvoll ist passwort login zu machen. was ist sicher und best pracitce bzw aktueller standard
der erste admin user ist simon@knoep.de und der kann dann weitere admins setzen. die manager rolle dürfen admins vergeben
3. check-in der turnieradmin oder ein helfer kann in der teilnehmerliste auf checkin clicken. die team größe kann beim erstellen configuiert werden auf 1 - n (hier erstmal 1-10). bzw in der logik macht es vermutlich sinn zwischen alleine und team zu unterscheiden
einladung per link
4. tie breaking: punkte für gewonnene spiele, becher-differenz, direkter vergleich
10er dreieck
helfer rolle ist nicht global sondern innerhalb eines turniers. ein manager kann ein turnier erstellen und kann normale nutzer als helfer für sein turnier ernennen. diese nutzer können, aber müssen kein teilnehmer des turniers sein
tischlayout soll pro turnier konfigurierbar sein. also anzahl tische (ggf auch bennenung möglich sein)
5. benachrichtigungen erstmal nicht, das kann ich ja in einem weiteren schritt implementieren