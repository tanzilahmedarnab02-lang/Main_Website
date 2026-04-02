with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove old duration from catalog section (below service name)
old1 = """{service.duration && <div className="flex items-center gap-1"><span className="text-[#E0A9C5] text-[8px]">●</span><span className={`font-mono text-[12px] md:text-[14px] uppercase tracking-wider ${isSelected ? 'text-[#E0A9C5]' : 'text-white group-hover:text-[#E0A9C5]'}`}>{service.duration}</span></div>}"""

new1 = """ """

if old1 in content:
    content = content.replace(old1, new1)
    print('Step 1: Removed old duration from catalog')
else:
    print('Step 1: Pattern not found')

# 2. Add duration with dot on right side of price in ServicePanel
old2 = """<span className={`font-impact tracking-wide ${selectedIds.includes(s.id) ? 'text-white' : 'text-white/60'} text-xl md:text-3xl pointer-events-none`}>{s.price}</span>"""

new2 = """<div className="flex items-center gap-2">
                  <span className={`font-impact tracking-wide ${selectedIds.includes(s.id) ? 'text-white' : 'text-white/60'} text-xl md:text-3xl pointer-events-none`}>{s.price}</span>
                  {s.duration && <div className="flex items-center gap-1"><span className="text-[#E0A9C5] text-[8px]">●</span><span className="font-mono text-[10px] md:text-[12px] uppercase tracking-wider text-white/80">{s.duration}</span></div>}
                </div>"""

if old2 in content:
    content = content.replace(old2, new2)
    print('Step 2: Added duration with dot in ServicePanel')
else:
    print('Step 2: Pattern not found')

# 3. Remove hardcoded duration text from ServicePanel
old3 = """<span className="font-mono text-[7px] md:text-[9px] text-white/60 uppercase">DURATION: 60 MIN</span>"""

new3 = """ """

if old3 in content:
    content = content.replace(old3, new3)
    print('Step 3: Removed hardcoded duration')
else:
    print('Step 3: Hardcoded duration not found')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
