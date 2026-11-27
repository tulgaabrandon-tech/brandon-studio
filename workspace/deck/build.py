# Builds the crew presentation: deck.html with the demo copy of the app embedded (base64), so it runs offline as one file.
#   python build.py claude && python deck/build.py   ->  deck/dist/index.html
import base64, os
here=os.path.dirname(os.path.abspath(__file__))
app=open(os.path.join(here,'..','dist-claude','index.html'),'rb').read()
deck=open(os.path.join(here,'deck.html'),encoding='utf-8').read()
assert '—' not in deck, 'no em dashes'
out=deck.replace('%%APP%%', base64.b64encode(app).decode())
os.makedirs(os.path.join(here,'dist'),exist_ok=True)
open(os.path.join(here,'dist','index.html'),'w',encoding='utf-8').write(out)
print('built deck', len(out))
