#define MyAppName "Lando"
#define MyAppPublisher "Lando"
#define MyAppURL "https://docs.devwithlando.io"
#define MyAppContact "https://docs.devwithlando.io"

#define docker "Docker.exe"
#define lando "bundle"
#define landoIco "lando.ico"
#define engine "engine.ps1"

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
DefaultDirName={pf}\{#MyAppName}
DefaultGroupName=Lando
DisableProgramGroupPage=yes
DisableWelcomePage=no
SignTool=signtool
SetupIconFile=lando.ico
SetupLogging=yes
SolidCompression=yes

OutputBaseFilename=lando
OutputDir=dist
WizardImageAlphaFormat=premultiplied
WizardImageFile=lando-side.bmp
WizardImageStretch=yes
WizardStyle=modern
UninstallDisplayIcon={app}\unins000.exe

[CustomMessages]
WelcomeLabel3=%nLando will also install Docker Desktop for you.%n%nDocker Desktop is a requirement!%n%nIf you do not already have Docker Desktop and you %nelect to not install Docker Desktop then Lando will not work!
FinishedMessage=%nLando Setup will now launch Docker Desktop for you!%n%nThis is a requirement to use Lando and may take a few moments to start.%nYou will immediately see a whale icon in your taskbar!

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Types]
Name: "full"; Description: "Full installation"
Name: "custom"; Description: "Custom installation"; Flags: iscustom

[Tasks]
Name: modifypath; Description: "Add lando binary to PATH"

[Components]
Name: "Lando"; Description: "Lando {#MyAppVersion}" ; Types: full custom; Flags: disablenouninstallwarning fixed
Name: "Docker"; Description: "Docker Desktop {#DockerVersion}" ; Types: full custom;

[Files]
Source: "{#lando}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs; Components: "Lando"
Source: "{#lando}\bin\lando.exe"; DestDir: "{app}"; Flags: signonce; Components: "Lando"
Source: "{#landoIco}"; DestDir: "{app}"; DestName: "Lando.ico"; Components: "Lando"
Source: "{#engine}"; DestDir: "{app}"; DestName: "engine.ps1"; Components: "Lando"
Source: "{#docker}"; DestDir: "{app}\installers\docker"; DestName: "docker.exe"; AfterInstall: RunInstallDocker(); Components: "Docker"

[Run]
Filename: powershell.exe; Parameters: "-ExecutionPolicy Bypass -File ""{app}\engine.ps1"""; Description: "Launch Docker"; WorkingDir: {app}; Flags: postinstall runasoriginaluser runhidden

[Registry]
Root: HKCU; Subkey: "Environment"; ValueType:string; ValueName:"LANDO_INSTALL_PATH"; ValueData:"{app}" ; Flags: preservestringtype ;

[InstallDelete]
Type: filesandordirs; Name: "{app}\installers\docker"

[UninstallDelete]
Type: filesandordirs; Name: "{userappdata}\..\.lando"

[Code]
var
  WelcomeLabel3: TNewStaticText;
  FinishedMessage: TNewStaticText;

procedure InitializeWizard;
begin
  WizardForm.WelcomeLabel2.AutoSize := True;

  WelcomeLabel3 := TNewStaticText.Create(WizardForm);
  WelcomeLabel3.Parent := WizardForm.WelcomePage;
  WelcomeLabel3.AutoSize := False;
  WelcomeLabel3.Left := WizardForm.WelcomeLabel2.Left;
  WelcomeLabel3.Top := WizardForm.WelcomeLabel2.Top + WizardForm.WelcomeLabel2.Height;
  WelcomeLabel3.Width := WizardForm.WelcomeLabel2.Width;
  WelcomeLabel3.Height := WizardForm.WelcomePage.Height - WelcomeLabel3.Top;
  WelcomeLabel3.Font.Assign(WizardForm.WelcomeLabel2.Font);
  WelcomeLabel3.Caption := CustomMessage('WelcomeLabel3');

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

function InitializeSetup(): Boolean;
begin
  if (FileExists(ExpandConstant('{pf}\Docker\Docker\resources\bin\docker.exe'))) then
  begin
    MsgBox('The installer has detected that Docker Desktop is already installed!' + #13#10 + #13#10 + 'Make sure you close Docker Desktop before continuing this installation as Lando will install the version it needs.' + #13#10 + #13#10 + 'If you wish to continue with your current version of Docker Desktop without upgrading make sure you customize your installation on the next step and choose to not install Docker Desktop.' + #13#10 + #13#10 + 'Keeping your current version of Docker Desktop is not supported so YMMV.', mbInformation, MB_OK);
    Result := True;
  end
  else
  begin
    Result := True;
  end;
end;

procedure RunInstallDocker();
var
  ResultCode: Integer;
begin
  WizardForm.FilenameLabel.Caption := 'Installing Docker Desktop...'
  if Exec(ExpandConstant('{app}\installers\docker\docker.exe'), 'install --quiet', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    // MsgBox('git installed OK', mbInformation, MB_OK);
  end
  else begin
    MsgBox('Docker Desktop install failure!', mbCriticalError, MB_OK);
  end
end;

const
  ModPathName = 'modifypath';
  ModPathType = 'user';

function ModPathDir(): TArrayOfString;
begin
  setArrayLength(Result, 1);
  Result[0] := ExpandConstant('{app}\bin');
end;
#include "modpath.iss"

procedure CurStepChanged(CurStep: TSetupStep);
var
  Success: Boolean;
begin
  Success := True;
  if CurStep = ssPostInstall then
  begin
    if IsTaskSelected(ModPathName) then
    begin
      ModPath();
    end;
  end;
end;
