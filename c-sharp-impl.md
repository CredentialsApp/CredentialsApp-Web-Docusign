using System.IO;
using iTextSharp.text;
using iTextSharp.text.pdf;

class Program
{
    static void Main(string[] args)
    {
        using (Stream inputPdfStream = new FileStream("input.pdf", FileMode.Open, FileAccess.Read, FileShare.Read))
        using (Stream inputImageStream = new FileStream("some_image.jpg", FileMode.Open, FileAccess.Read, FileShare.Read))
        using (Stream outputPdfStream = new FileStream("result.pdf", FileMode.Create, FileAccess.Write, FileShare.None))
        {
            var reader = new PdfReader(inputPdfStream);
            var stamper = new PdfStamper(reader, outputPdfStream);
            var pdfContentByte = stamper.GetOverContent(1);

            Image image = Image.GetInstance(inputImageStream);
            image.SetAbsolutePosition(100, 100);
            pdfContentByte.AddImage(image);
            stamper.Close();
        }
    }
}