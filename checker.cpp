#include <algorithm>
#include <fstream>
#include <iostream>
#include <set>
#include <sstream>
#include <vector>

using namespace std;

int n, m, k;
set<string> edges;
vector<vector<int>> p;

string build_edge(int p1, int v1, int p2, int v2) {
	if (p1 >= 1 && p1 <= n && p2 >= 1 && p2 <= n && v1 >= 1 && v1 <= m && v2 >= 1 && v2 <= m && p1 != p2) {
		stringstream ss;
		if (p1 < p2) {
			ss << p1 << " " << v1 << " " << p2 << " " << v2;
		} else {
			ss << p2 << " " << v2 << " " << p1 << " " << v1;
		}
		return ss.str();
	}
	return "";
}

void insert_edge(int p1, int v1, int p2, int v2) {
	string e = build_edge(p1, v1, p2, v2);
	if (!e.empty()) {
		edges.insert(e);
	}
}

bool check_clique(vector<int> v) {
	for (int i = 0; i < n; ++ i) {
		for (int j = i + 1; j < n; ++ j) {
			auto e = build_edge(i + 1, v[i], j + 1, v[j]);
			if (!edges.count(e)) {
				return false;
			}
		}
	}
	return true;
}

bool compare(vector<int> v) {
	for (auto s: p) {
		bool all_greater = true;
		bool all_smaller = true;
		for (int j = 0; j < n; ++ j) {
			if (v[j] < s[j]) {
				all_greater = false;
			} else if (v[j] > s[j]) {
				all_smaller = false;
			}
		}
		if (!all_greater && all_smaller) {
			return false;
		}
	}
	return true;
}

stringstream read_line() {
	string res;
	if (cin.eof()) {
		exit(1);
	}
	getline(cin, res);
	return stringstream(res);
}

void read_contest() {
	read_line() >> n >> m >> k;
	if (n <= 0 || m <= 0 || k <= 0) {
		exit(1);
	}
}

vector<vector<int>> read_sol() {
	int t;
	read_line() >> t;
	if (t <= 0) {
		exit(1);
	}
	vector<vector<int>> res;
	for (int i = 0; i < t; ++ i) {
		vector<int> v;
		stringstream ss = read_line();
		for (int j = 0; j < n; ++ j) {
			int x;
			ss >> x;
			v.push_back(x);
		}
		res.push_back(v);
		if (!check_clique(v)) {
			exit(1);
		}
		res.push_back(v);
	}
	return res;
}

void read_poser() {
	int l;
	read_line() >> l;
	if (l > k) {
		exit(1);
	}
	for (int i = 0; i < l; ++ i) {
		int a, b, c, d;
		read_line() >> a >> b >> c >> d;
		insert_edge(a, b, c, d);
	}
	p = read_sol();
	cout << edges.size() << endl;
	for (auto e: edges) {
		cout << e << endl;
	}
}

int main(int argc, char **argv) {
	read_contest();
	read_poser();
	if (argc > 1) {
		auto sol = read_sol();
		bool win = true;
		for (auto s: sol) {
			win &= compare(s);
		}
		if (win) {
			cerr << win << endl;
		}
	}
	if (!cin.eof()) {
		exit(1);
	}
	return 0;
}