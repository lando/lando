#define MyAppName "Lando"
#define MyAppPublisher "Lando"
#define MyAppURL "https://docs.lando.dev"
#define MyAppContact "mike@lando.dev"

#define lando "bundle"
#define landoIco "lando.ico"

#include "environment.iss"

[Setup]
AppCopyright={#MyAppPublisher}
AppContact={#MyAppContact}
AppComments={#MyAppURL}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
ChangesEnvironment=true
Compression=lzma
DefaultDirName={commonpf}\{#MyAppName}
DefaultGroupName=Lando
DisableProgramGroupPage=yes
DisableWelcomePage=no
MinVersion=10.0.19042
SignTool=signtool
SetupIconFile=lando.ico
SetupLogging=yes
SolidCompression=yes
OutputBaseFilename=LandoInstaller
OutputDir=dist
WizardImageAlphaFormat=premultiplied
WizardImageFile=lando-side.bmp
WizardImageStretch=yes
WizardStyle=modern
UninstallDisplayIcon={app}\unins000.exe

[CustomMessages]
FinishedMessage=%nLando is now ready!%n%nLaunch your terminal and run "lando"!

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Types]
Name: "full"; Description: "Full installation"
Name: "custom"; Description: "Custom installation"; Flags: iscustom

[Tasks]
Name: modifypath; Description: "Add lando.exe to PATH"

[Components]
Name: "Lando"; Description: "Lando CLI {#LandoCLIVersion}" ; Types: full custom; Flags: disablenouninstallwarning fixed

[Files]
Source: "{#lando}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs; Components: "Lando"
Source: "{#lando}\bin\lando.exe"; DestDir: "{app}"; Flags: signonce; Components: "Lando"
Source: "{#landoIco}"; DestDir: "{app}"; DestName: "Lando.ico"; Components: "Lando"

[Registry]
Root: HKCU; Subkey: "Environment"; ValueType:string; ValueName:"LANDO_INSTALL_PATH"; ValueData:"{app}" ; Flags: preservestringtype ;

[UninstallDelete]
Type: filesandordirs; Name: "{userappdata}\..\.lando"

[Code]
var
  FinishedMessage: TNewStaticText;

procedure InitializeWizard;
begin
  WizardForm.WelcomeLabel2.AutoSize := True;

  FinishedMessage := TNewStaticText.Create(WizardForm);
  FinishedMessage.Parent := WizardForm.FinishedPage;
  FinishedMessage.AutoSize := False;
  FinishedMessage.Left := WizardForm.FinishedLabel.Left;
  FinishedMessage.Top := WizardForm.FinishedLabel.Top + WizardForm.FinishedLabel.Height + WizardForm.FinishedLabel.Height;
  FinishedMessage.Width := WizardForm.FinishedLabel.Width;
  FinishedMessage.Height := WizardForm.FinishedPage.Height - FinishedMessage.Top;
  FinishedMessage.Font.Assign(WizardForm.FinishedLabel.Font);
  FinishedMessage.Font.Style := [fsBold];
  FinishedMessage.Caption := CustomMessage('FinishedMessage');
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
    if (CurStep = ssPostInstall) and WizardIsTaskSelected('modifypath')
    then EnvAddPath(ExpandConstant('{app}\bin'));
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
    if CurUninstallStep = usPostUninstall
    then EnvRemovePath(ExpandConstant('{app}\bin'));
end;
