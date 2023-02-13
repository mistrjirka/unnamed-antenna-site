class Complex:
    def __init__(self, real, imag):
        self.real = real
        self.imag = imag
    
    def __sub__(self, other):
        return Complex(self.real - other.real, self.imag - other.imag)
    
    def __add__(self, other):
        return Complex(self.real + other.real, self.imag + other.imag)
    
    def __truediv__(self, other):
        return Complex((self.real * other.real + self.imag * other.imag)/(other.real**2 + other.imag**2), (self.imag * other.real - self.real * other.imag)/(other.real**2 + other.imag**2))
    
    def __abs__(self):
        return (self.real **2+ self.imag**2)**0.5

if __name__ == "__main__":
    zl = Complex(-0.7514944970607758, -0.6721603870391846)
    swr = (1+abs(zl))/(1-abs(zl))
    print(swr)
