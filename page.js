import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const Page03 = () => {
  const [selectedColor, setSelectedColor] = useState('');
  const [showNext, setShowNext] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    if (selectedColor) {
      const timer = setTimeout(() => {
        setShowNext(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedColor]);

  const handleColorSelect = (color, value) => {
    setSelectedColor(color);
    setSelectedValue(value);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 上半部分 */}
      <div className="h-1/2 bg-gray-100 flex items-center justify-center">
        <div className="space-x-4">
          <Button 
            className="bg-red-500 hover:bg-red-600"
            onClick={() => handleColorSelect('bg-red-200', 1)}
          >
            選項一
          </Button>
          <Button 
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => handleColorSelect('bg-blue-200', 2)}
          >
            選項二
          </Button>
          <Button 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => handleColorSelect('bg-green-200', 3)}
          >
            選項三
          </Button>
        </div>
      </div>

      {/* 下半部分 */}
      <div className={`h-1/2 transition-colors duration-300 flex items-center justify-center ${selectedColor}`}>
        {showNext && (
          <Button 
            className="bg-purple-500 hover:bg-purple-600"
            onClick={() => {
              // 這裡可以處理數值的傳遞
              console.log('Selected value:', selectedValue);
              // 導航到下一頁的邏輯
            }}
          >
            前往下一頁
          </Button>
        )}
      </div>
    </div>
  );
};

export default Page03;