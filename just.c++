#include<iostream>
using namespace std;
int main() {
    int i= -1;
    cout<<"i = -1"<<endl;
    cout << "i + (i + (i++ + i++))"<<":"<<i + (i + (i++ + i++))<<endl;
     i= -1;
    cout << "i + (i + (++i + ++i )): " << i + (i + (++i + ++i ))<<endl;
     i= -1;
    cout<<"i + i + i++ + i++ : "<<i + i + i++  + i++ <<endl;
     i= -1;
    cout<<"i + i + ++i + ++i: "<< i + i + ++i + ++i << endl;
} 
   // gcc -fdump-tree-cfg  just.c