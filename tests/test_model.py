import importlib.util, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('demo',Path(__file__).resolve().parents[1]/'examples/train_synthetic.py')
demo=importlib.util.module_from_spec(spec);spec.loader.exec_module(demo)
class ReproductionTests(unittest.TestCase):
    def test_deterministic_and_split(self):
        a=demo.run();b=demo.run();self.assertEqual(a,b);self.assertEqual((a['train_rows'],a['test_rows']),(300,100));self.assertGreater(a['synthetic_test_accuracy'],.8)
    def test_sigmoid_extremes(self):
        self.assertGreater(demo.sigmoid(100),.99);self.assertLess(demo.sigmoid(-100),.01)
