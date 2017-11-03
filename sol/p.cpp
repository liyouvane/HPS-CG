#include <algorithm>
#include <iostream>
#include <iterator>
#include <set>
#include <vector>

using namespace std;

int n, m, k;
int e;
bool g[1000][1000];

set<int> generate(vector<int> &p) {
	set<int> res;
	vector<int> tmp;
	int x = rand() % (n * m);
	res.insert(x);
	tmp.push_back(x);
	int c = rand() % (n + m) + 1;
	while (c --) {
		int y = tmp[rand() % tmp.size()];
		int z = -1;
		int t = 0;
		for (int i = 0; i < n * m; ++ i) {
			if (!res.count(i) && (p[i] == y || p[y] == i)) {
				t += 1;
				if (rand() % t == 0) {
					z = i;
				}
			}
		}
		if (z != -1 && !res.count(z)) {
			res.insert(z);
			tmp.push_back(z);
		}
	}
	return res;
}

bool okay(vector<set<int>> &v) {
	e = 0;
	for (int i = 0; i < n * m; ++ i)
		for (int j = i + 1; j < n * m; ++ j) {
			vector<int> intersection;
			set_intersection(
					v[i].begin(),
					v[i].end(),
					v[j].begin(),
					v[j].end(),
					back_inserter(intersection));
			g[i][j] = 0;
			if (!intersection.empty()) {
				g[i][j] = 1;
				++ e;
			}
		}
	return e <= k;
}

int main() {
	cin >> n >> m >> k;

	vector<int> p(n * m, -1);
	for (int i = 1; i < n * m; ++ i) {
		p[i] = rand() % i;
	}

	vector<set<int>> v;
	for (int i = 0; i < n * m; ++ i) {
		v.push_back(generate(p));
	}

	while (!okay(v)) {
		int i = rand() % (n * m);
		v[i] = generate(p);
	}

	vector<int> a(n * m, 0);
	vector<int> b(n * m, 0);

	vector<int> r(n + 1, m);

	int f = 0;

	for (int i = 0; i < n * m; ++ i) {
		int t = 0;
		for (int j = 0; j < n * m; ++ j)
			if (v[j].count(i))
				t += 1;
		if (t >= n) {
			f = 1;
			int x = 1;
			for (int j = 0; j < n * m; ++ j)
				if (v[j].count(i) && a[j] == 0) {
					while (r[x] == 0)
						x = (x == n) ? 1 : x + 1;
					a[j] = x;
					b[j] = r[x];
					r[x] -= 1;
					x = (x == n) ? 1 : x + 1;
				}
		}
	}
	for (int i = 0; i < n * m; ++ i)
		if (a[i] == 0) {
			int x = 1;
			while (r[x] == 0)
				x = x + 1;
			a[i] = x;
			b[i] = r[x];
			r[x] -= 1;
		}

	// done!
	cout << e << endl;
	for (int i = 0; i < n * m; ++ i)
		for (int j = 0; j < n * m; ++ j)
			if (g[i][j])
				cout << a[i] << " " << b[i] << " " << a[j] << " " << b[j] << "\n";

	cout << f << endl;
	if (f) {
		for (int i = 0; i < n; ++ i)
			cout << m << (i == n - 1 ? '\n' : ' ');
	}
}