param([Parameter(Mandatory=$true)][string]$InputPath)
$resolved=(Resolve-Path -LiteralPath $InputPath).Path
$pdf=[System.IO.Path]::ChangeExtension($resolved,".pdf")
$excel=$null;$book=$null
try {$excel=New-Object -ComObject Excel.Application;$excel.Visible=$false;$excel.DisplayAlerts=$false;$book=$excel.Workbooks.Open($resolved);$book.ExportAsFixedFormat(0,$pdf)}
finally {if($book){$book.Close($false);[void][Runtime.InteropServices.Marshal]::ReleaseComObject($book)};if($excel){$excel.Quit();[void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel)}}
