#define MyAppName "Lando"
#define MyAppPublisher "Lando"
#define MyAppURL "https://docs.devwithlando.io"
#define MyAppContact "https://docs.devwithlando.io"

#define docker "Docker.exe"
#define engineSetup "engine.bat"
#define lando "bundle"
#define landoIco "lando.ico"
#define git "Git.exe"

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
DefaultDirName={pf}\{#MyAppName}
DefaultGroupName=Lando
DisableProgramGroupPage=yes
DisableWelcomePage=no
OutputDir=dist
OutputBaseFilename=lando
WizardImageAlphaFormat=premultiplied
WizardSmallImageFile=lando.bmp
WizardImageFile=lando-side.bmp
Compression=lzma
SolidCompression=yes
WizardImageStretch=yes
UninstallDisplayIcon={app}\unins000.exe
SetupIconFile=lando.ico
SetupLogging=yes
ChangesEnvironment=true

[CustomMessages]
WelcomeLabel3=%nLando will also install Docker for Windows for you.%n%nDocker for Windows is a requirement!%n%nIf you do not already have Docker for Windows and you %nelect to not install Docker for Windows then Lando will not work!

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Types]
Name: "full"; Description: "Full installation"
Name: "custom"; Description: "Custom installation"; Flags: iscustom

[Tasks]
Name: modifypath; Description: "Add lando binary to PATH"

[Components]
Name: "Git"; Description: "Git for Windows"; Types: full custom;
Name: "Lando"; Description: "Lando" ; Types: full custom; Flags: disablenouninstallwarning fixed
Name: "Docker"; Description: "Docker for Windows" ; Types: full custom;

[Files]
Source: "{#lando}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs; Components: "Lando"
Source: "{#landoIco}"; DestDir: "{app}"; DestName: "Lando.ico"; Components: "Lando"
Source: "{#docker}"; DestDir: "{app}\installers\docker"; DestName: "docker.exe"; BeforeInstall: CheckHyperV(); AfterInstall: RunInstallDocker(); Components: "Docker"
Source: "{#engineSetup}"; DestDir: "{app}"; Components: "Docker"; AfterInstall: RunEngineSetup();
Source: "{#git}"; DestDir: "{app}\installers\git"; DestName: "git.exe"; AfterInstall: RunInstallGit(); Components: "Git"

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
    MsgBox('The installer has detected that Docker for Windows is already installed!' + #13#10 + #13#10 + 'If you are using the Stable version make sure you close Docker for Windows before continuing this installation as Lando will install the latest version.' + #13#10 + #13#10 + 'If you wish to continue with your current version of Docker for Windows without upgrading make sure you customize your installation on the next step and choose to not install Docker for Windows.' + #13#10 + #13#10 + 'Keeping your current version of Docker for Windows is not supported so YMMV.' + #13#10 + #13#10 + 'Also note that if you are upgrading from Docker for Windows 17.09.0-ce-win27 or earlier you may need to uninstall Docker for Windows for this installer to succeed.', mbInformation, MB_OK);
    Result := True;
  end
  else
  begin
    Result := True;
  end;
end;

procedure CheckHyperV();
var
  ResultCode: Integer;
begin
  WizardForm.FilenameLabel.Caption := 'Checking that HyperV is enabled and running...'
  if ExecAsOriginalUser(ExpandConstant('sc'), ExpandConstant('query vmms'), '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if ( ResultCode = 0 ) then
    begin
      Log('HyperV is running with code ' + IntToStr(ResultCode));
    end
    else begin
      Log('HyperV is not running with code ' + IntToStr(ResultCode));
      MsgBox('HyperV is not running! Please install first and then run this installer.', mbCriticalError, MB_OK);
      WizardForm.Close;
      exit;
    end;
  end
  else begin
    Log('Something bad happened with code ' + IntToStr(ResultCode));
    MsgBox('Something bad happened. Install Fail.', mbCriticalError, MB_OK);
  end;
end;

procedure RunInstallDocker();
var
  ResultCode: Integer;
begin
  MsgBox('You will now be prompted to install Docker for Windows.' + #13#10 +  #13#10 + 'Please approve any Docker installation prompts to make sure your Lando install completes with great success!', mbInformation, MB_OK);
  WizardForm.FilenameLabel.Caption := 'Installing Docker for Windows...'
  if Exec(ExpandConstant('{app}\installers\docker\docker.exe'), '', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    //MsgBox('git installed OK', mbInformation, MB_OK);
  end
  else begin
    MsgBox('Docker for Windows install failure!', mbCriticalError, MB_OK);
  end
end;

procedure RunInstallGit();
var
  ResultCode: Integer;
begin
  WizardForm.FilenameLabel.Caption := 'Installing Git for Windows'
  if Exec(ExpandConstant('{app}\installers\git\git.exe'), '/sp- /verysilent /norestart', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    // handle success if necessary; ResultCode contains the exit code
    //MsgBox('git installed OK', mbInformation, MB_OK);
  end
  else begin
    // handle failure if necessary; ResultCode contains the error code
    MsgBox('git install failure', mbCriticalError, MB_OK);
  end
end;

procedure RunEngineSetup();
var
  ResultCode: Integer;
begin
  WizardForm.FilenameLabel.Caption := 'Activating the HyperV Docker Engine...'
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
