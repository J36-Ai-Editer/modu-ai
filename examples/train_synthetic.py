"""Reproducible binary classification on abstract synthetic features; no health meaning."""
import json, math, random
from pathlib import Path

def sigmoid(x):
    return 1 / (1 + math.exp(-max(-40, min(40, x))))

def run(seed=42):
    rng=random.Random(seed)
    rows=[]
    for _ in range(400):
        x=[rng.uniform(-1,1) for _ in range(3)]
        y=int(1.8*x[0]-1.2*x[1]+0.6*x[2]+rng.gauss(0,.25)>0)
        rows.append((x,y))
    train,test=rows[:300],rows[300:]
    weights=[0.0]*4
    for _ in range(600):
        grad=[0.0]*4
        for x,y in train:
            v=[1.0]+x;e=sigmoid(sum(a*b for a,b in zip(weights,v)))-y
            for j in range(4):grad[j]+=e*v[j]/len(train)
        weights=[w-.4*g for w,g in zip(weights,grad)]
    correct=sum(int(sigmoid(weights[0]+sum(a*b for a,b in zip(weights[1:],x)))>=.5)==y for x,y in test)
    return {'purpose':'synthetic educational demo; no medical meaning','seed':seed,'features':['abstract_a','abstract_b','abstract_c'],'train_rows':len(train),'test_rows':len(test),'weights':weights,'synthetic_test_accuracy':correct/len(test)}

if __name__=='__main__':
    result=run();out=Path(__file__).parent/'synthetic_model.json'
    out.write_text(json.dumps(result,indent=2),encoding='utf-8');print(out);print('Synthetic test accuracy:',result['synthetic_test_accuracy'])
