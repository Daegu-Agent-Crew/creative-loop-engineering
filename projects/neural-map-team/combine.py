#!/usr/bin/env python3
"""Combine structure.html + animations.css + data-viz.js into index.html"""
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with open('structure.html', 'r') as f:
    html = f.read()
with open('animations.css', 'r') as f:
    css = f.read()
with open('data-viz.js', 'r') as f:
    js = f.read()

html = html.replace('<link rel="stylesheet" href="animations.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<script src="data-viz.js"></script>', '<script>\n' + js + '\n</script>')

with open('index.html', 'w') as f:
    f.write(html)

print('Done:', len(html), 'bytes')
print('css ref' if 'animations.css' in html else 'css OK')
print('js ref' if 'data-viz.js' in html else 'js OK')
