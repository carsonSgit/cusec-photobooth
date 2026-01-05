export async function generatePhotoStrip(photos: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    if (photos.length !== 3) {
      reject(new Error('Exactly 3 photos are required'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Thermal printer paper: 57mm wide at 300 DPI
    // 57mm = 57/25.4 * 300 ≈ 673 pixels
    const DPI = 300;
    const PAPER_WIDTH_MM = 57;
    const canvasWidth = Math.round((PAPER_WIDTH_MM / 25.4) * DPI);

    const headerHeight = 80;
    const footerHeight = 60;
    const photoGap = 32;
    const borderWidth = 2;

    let loadedImages = 0;
    const imageElements: HTMLImageElement[] = [];

    const checkAllLoaded = () => {
      if (loadedImages === 3) {
        calculateAndDraw();
      }
    };

    const calculateAndDraw = () => {
      const photoHeights = imageElements.map((img) => {
        const aspectRatio = img.height / img.width;
        return Math.round(canvasWidth * aspectRatio);
      });

      const totalPhotoHeight = photoHeights.reduce((sum, h) => sum + h, 0);
      const totalGaps = photoGap * 2;
      const canvasHeight = headerHeight + totalPhotoHeight + totalGaps + footerHeight;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 52px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CUSEC 2026', canvas.width / 2, headerHeight / 2);

      let currentY = headerHeight;
      imageElements.forEach((img, index) => {
        const photoHeight = photoHeights[index];
        ctx.drawImage(img, 0, currentY, canvasWidth, photoHeight);
        currentY += photoHeight + photoGap;
      });

      const footerY = canvasHeight - footerHeight;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CUSEC 2026', canvas.width / 2, footerY + (footerHeight / 2));

      resolve(canvas.toDataURL('image/png'));
    };
    photos.forEach((photoData, index) => {
      const img = new Image();
      img.onload = () => {
        imageElements[index] = img;
        loadedImages++;
        checkAllLoaded();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image ${index + 1}`));
      };
      img.src = photoData;
    });
  });
}
