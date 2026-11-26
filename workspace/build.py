# Builds BrandOn Studio into one HTML file.
#   python build.py          -> public/index.html (your own hosting, with Supabase + Telegram)
#   python build.py claude   -> dist-claude/index.html (the Claude page version)
import sys, os
here=os.path.dirname(os.path.abspath(__file__))
src=lambda f: open(os.path.join(here,'src',f),encoding='utf-8').read()
css=src('style.css')
claude=len(sys.argv)>1 and sys.argv[1]=='claude'
# The hosted build carries no sample artwork or sample projects: it starts with the team only.
files=['i18n.js','art.js','core.js','sample.js','hosted.js','finance.js','fupload.js','fjobs.js','icons.js','views.js','actions.js'] if claude else ['i18n.js','core.js','hosted.js','finance.js','fupload.js','fjobs.js','icons.js','views.js','actions.js']
NOSAMPLE="window.BO_HOSTED=true;\nfunction sampleSet(){ return {projects:[],tasks:[],ann:[],events:[]}; }\nfunction startDemo(){ S.mode='setup'; render(); }\n"
js="(function(){\n'use strict';\n"+('' if claude else NOSAMPLE)+''.join(src(f)+'\n' for f in files)+"document.documentElement.lang=LANG;\nboot();\n})();\n"
head_extra='' if claude else ('<meta name="theme-color" content="#DA1F34">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon-192.png">\n<link rel="apple-touch-icon" href="icon-192.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n'
  '<script src="config.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n')
html=('<!DOCTYPE html>\n<html lang="mn">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>BrandOn Studio</title>\n'
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link href="https://fonts.googleapis.com/css2?family=Onest:wght@300..900&display=swap" rel="stylesheet">\n'
  +head_extra+'<style>\n'+css+'\n</style>\n</head>\n<body>\n<div id="root"></div>\n<div class="overlay" id="modal"></div>\n<div id="palette"></div>\n<div class="toast" id="toast" role="status" aria-live="polite"></div>\n<script>\n'+js+'</script>\n</body>\n</html>\n')
out=os.path.join(here,'dist-claude' if claude else 'public','index.html')
os.makedirs(os.path.dirname(out),exist_ok=True)
open(out,'w',encoding='utf-8').write(html)
assert '—' not in html, 'em dash found'
print('built', out, len(html))
