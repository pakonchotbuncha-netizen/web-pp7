import io
out = []
for f in ['succession-plan-dashboard.html','succession-roles-map.html','succession-member-tabs.html']:
    s = io.open(f, encoding='utf-8').read()
    # count GAT BSC report marker occurrences
    bsc = s.count('BSC')
    # count emoji chart marker
    chart = s.count('\U0001F4CA')
    out.append('%s BSC=%d CHART=%d' % (f, bsc, chart))
open('/tmp/ascii_result.txt','w').write('\n'.join(out))
print('OK')
