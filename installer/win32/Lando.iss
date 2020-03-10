#define MyAppName "Lando"
#define MyAppPublisher "Lando"
#define MyAppURL "https://docs.devwithlando.io"
#define MyAppContact "https://docs.devwithlando.io"

#define docker "Docker.exe"
#define lando "bundle"
#define landoIco "lando.ico"
#define engineSetup "engine.bat"
#define settings "settings.ps1"

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
Source: "{#landoIco}"; DestDir: "{app}"; DestName: "Lando.ico"; Components: "Lando"
Source: "{#docker}"; DestDir: "{app}\installers\docker"; DestName: "docker.exe"; AfterInstall: RunInstallDocker(); Components: "Docker"
Source: "{#settings}"; DestDir: "{app}"; Components: "Docker"; AfterInstall: RunSetttingsSetup();
Source: "{#engineSetup}"; DestDir: "{app}"; Components: "Docker"; AfterInstall: RunEngineSetup();

[Registry]
Root: HKCU; Subkey: "Environment"; ValueType:string; ValueName:"LANDO_INSTALL_PATH"; ValueData:"{app}" ; Flags: preservestringtype ;

[UninstallDelete]
Type: filesandordirs; Name: "{userappdata}\..\.lando"

[Code]
var
  WelcomeLabel3: TNewStaticText;

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
    //MsgBox('git installed OK', mbInformation, MB_OK);
  end
  else begin
    MsgBox('Docker Desktop install failure!', mbCriticalError, MB_OK);
  end
end;

procedure RunSetttingsSetup();
var
  ResultCode: Integer;
begin
  WizardForm.FilenameLabel.Caption := 'Modifying Docker Config...'
  if ExecAsOriginalUser(ExpandConstant('{app}\settings.ps1'), '', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if ( ResultCode = 0 ) then
    begin
      Log('Docker settings modified! ' + IntToStr(ResultCode));
    end
    else begin
      Log('Docker settings modification failed with code ' + IntToStr(ResultCode));
      WizardForm.Close;
      exit;
    end;
  end
  else begin
    Log('Something bad happened with code ' + IntToStr(ResultCode));
    MsgBox('Something bad happened. Install Fail.', mbCriticalError, MB_OK);
  end;
end;

procedure RunEngineSetup();
var
  ResultCode: Integer;
begin
  WizardForm.FilenameLabel.Caption := 'Activating the Docker Engine...'
  if ExecAsOriginalUser(ExpandConstant('{app}\engine.bat'), '', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if ( ResultCode = 0 ) then
    begin
      Log('Engine activated with great success and result code ' + IntToStr(ResultCode));
    end
    else begin
      Log('Engine activation failed with code ' + IntToStr(ResultCode));
      MsgBox('Engine activation failed!', mbCriticalError, MB_OK);
      WizardForm.Close;
      exit;
    end;
  end
  else begin
    Log('Something bad happened with code ' + IntToStr(ResultCode));
    MsgBox('Something bad happened. Install Fail.', mbCriticalError, MB_OK);
  end;
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
