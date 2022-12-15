#define MyAppName "Lando"
#define MyAppPublisher "Lando"
#define MyAppURL "https://docs.lando.dev"
#define MyAppContact "mike@lando.dev"

#define docker "Docker.exe"
#define lando "bundle"
#define landoIco "lando.ico"
#define engine "engine.ps1"

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
WelcomeLabel3=%nLando will also install Docker Desktop for you if needed!%nNote that Docker Desktop is a requirement.
FinishedMessage=%nLando Setup will now launch Docker Desktop for you!%n%nThis is a requirement to use Lando and may take a few moments to start.%nYou will immediately see a whale icon in your taskbar!

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Types]
Name: "full"; Description: "Full installation"
Name: "custom"; Description: "Custom installation"; Flags: iscustom

[Tasks]
Name: modifypath; Description: "Add lando.exe to PATH"

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
  Result := True;
end;

procedure RunInstallDocker();
var
  ResultCode: Integer;
  User: String;
begin
  WizardForm.FilenameLabel.Caption := 'Installing Docker Desktop... this may take a few minutes...'
  if ExecAsOriginalUser(ExpandConstant('{app}\installers\docker\docker.exe'), 'install --quiet --no-windows-containers --backend=wsl-2', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    Log('Docker Desktop installation succeeded with code: ' + IntToStr(ResultCode));
  end
  else begin
    Log('Docker Desktop installation FAILED with code: ' + IntToStr(ResultCode));
  end;

  User := ExpandConstant('{username}');
  WizardForm.FilenameLabel.Caption := 'Adding ' + User + ' to docker-users group...'
  if Exec('net.exe', ExpandConstant('localgroup docker-users {username} /add'), '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    Log(User + 'was added to the docker-users group with code: ' + IntToStr(ResultCode));
  end
  else begin
    Log(User + 'was not added to the docker-users group with code: ' + IntToStr(ResultCode));
  end;
end;

procedure CurPageChanged(CurPageID: Integer);
var
  TargetDockerVersionString: String;
  TargetDockerVersion: Int64;
  HostDockerVersionString: String;
  HostDockerVersion: Int64;
  VersionComparison: Integer;

begin
  if CurPageID = wpSelectComponents then
  begin
    TargetDockerVersionString := ExpandConstant('{#DockerVersion}');
    StrToVersion(TargetDockerVersionString, TargetDockerVersion);
    Log('Lando wants Docker Desktop version: ' + TargetDockerVersionString + ':' + IntToStr(TargetDockerVersion));

    if RegValueExists(HKEY_LOCAL_MACHINE, 'SOFTWARE\Docker Inc.\Docker\1.0', 'HumanVersion') then
    begin
      RegQueryStringValue(HKEY_LOCAL_MACHINE, 'SOFTWARE\Docker Inc.\Docker\1.0', 'HumanVersion', HostDockerVersionString);
      StrToVersion(HostDockerVersionString, HostDockerVersion);
      Log('Detected Docker Desktop version: ' + HostDockerVersionString + ':' + IntToStr(HostDockerVersion));
      VersionComparison := ComparePackedVersion(HostDockerVersion, TargetDockerVersion);
      Log('Version comparison result: ' + IntToStr(VersionComparison));

      if VersionComparison > 0 then
      begin
        Log('Host Docker Desktop version ahead of target. Component disabled.');
        MsgBox('Newer Docker Desktop detected!' + #13#10 + #13#10 + 'The installer has detected that your version of Docker Desktop is ahead of what Lando expects!.' + #13#10 + #13#10 + 'This is probably ok but is technically unsupported so YMMV.', mbInformation, MB_OK);
        WizardForm.ComponentsList.Checked[1] := False;
        WizardForm.ComponentsList.ItemEnabled[1] := False;
        WizardForm.ComponentsList.ItemCaption[1] := WizardForm.ComponentsList.ItemCaption[1] + ' (Already installed)';
      end;
      if VersionComparison = 0 then
      begin
        Log('Host and target Docker Desktop versions are the same! Component disabled.');
        WizardForm.ComponentsList.Checked[1] := False;
        WizardForm.ComponentsList.ItemEnabled[1] := False;
        WizardForm.ComponentsList.ItemCaption[1] := WizardForm.ComponentsList.ItemCaption[1] + ' (Already installed)';
      end;
      if VersionComparison = -1 then
      begin
        Log('Host Docker Desktop version is behind target. Component enabled.');
        MsgBox('Older Docker Desktop detected!' + #13#10 + #13#10 + 'The installer has detected an older version of Docker Desktop but we can update it for you!' + #13#10 + #13#10 + 'You can also skip its installation to proceed with your current version.', mbInformation, MB_OK);
        WizardForm.ComponentsList.Checked[1] := True;
        WizardForm.ComponentsList.ItemEnabled[1] := True;
      end;
    end
    else begin
      Log('Could not detect Docker Desktop!');
      MsgBox('Docker Desktop not detected!' + #13#10 + #13#10 + 'The installer has detected that Docker Desktop is not installed but we can install it for you.' + #13#10 + #13#10 + 'You can also skip its installation however it is required for Lando to work.', mbInformation, MB_OK);
      WizardForm.ComponentsList.Checked[1] := True;
      WizardForm.ComponentsList.ItemEnabled[1] := True;
    end;
  end;
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
