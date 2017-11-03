n, m, k = map(int, raw_input().split())
g = [map(int, raw_input().split()) for i in xrange(k)]
d = [[set() for j in xrange(m + 1)] for i in xrange(n + 1)]
for i in xrange(k):
	if g[i][0] != g[i][2]:
		d[g[i][0]][g[i][1]].add(g[i][2])
		d[g[i][2]][g[i][3]].add(g[i][0])
c = [[0 for j in xrange(m + 1)] for i in xrange(n + 1)]
for i in xrange(k):
	if g[i][0] != g[i][2]:
		if len(d[g[i][0]][g[i][1]]) >= n - 1 and len(d[g[i][2]][g[i][3]]) >= n - 1:
			c[g[i][0]][g[i][1]] += 1
			c[g[i][2]][g[i][3]] += 1
# This is an incorrect solution.
s = []
for i in xrange(1, n + 1):
	s.append(max(xrange(m, 0, -1), key=lambda x: c[i][x]))
print(1)
print(' '.join(map(str, s)))