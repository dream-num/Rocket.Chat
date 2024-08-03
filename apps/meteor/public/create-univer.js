const customEventElement = document.createElement('div');

window.customEventElement = customEventElement;

customEventElement.addEventListener("createUniver", (e) => {
	createUniverWithCollaboration(e.detail.ref, e.detail.url);
});


function createUniver(container, url) {
	var {
		UniverCore,
		UniverDesign,
		UniverEngineRender,
		UniverEngineFormula,
		UniverDocs,
		UniverDocsUi,
		UniverUi,
		UniverSheets,
		UniverSheetsUi,
		UniverSheetsNumfmt,
		UniverSheetsFormula,
		UniverFacade,
	  } = window

	  var univer = new UniverCore.Univer({
		theme: UniverDesign.defaultTheme,
		locale: UniverCore.LocaleType.EN_US,
		locales: {
		  [UniverCore.LocaleType.EN_US]: UniverUMD['en-US'],
		},
	  });

	  univer.registerPlugin(UniverEngineRender.UniverRenderEnginePlugin);
	  univer.registerPlugin(UniverEngineFormula.UniverFormulaEnginePlugin);

	  univer.registerPlugin(UniverUi.UniverUIPlugin, {
		container,
		header: false,
        footer: false,
	  });

	  univer.registerPlugin(UniverDocs.UniverDocsPlugin, {
		hasScroll: false,
	  });
	  univer.registerPlugin(UniverDocsUi.UniverDocsUIPlugin);

	  univer.registerPlugin(UniverSheets.UniverSheetsPlugin);
	  univer.registerPlugin(UniverSheetsUi.UniverSheetsUIPlugin);
	  univer.registerPlugin(UniverSheetsNumfmt.UniverSheetsNumfmtPlugin);
	  univer.registerPlugin(UniverSheetsFormula.UniverSheetsFormulaPlugin);

	  univer.createUnit(UniverCore.UniverInstanceType.UNIVER_SHEET, {})

	  const univerAPI = UniverFacade.FUniver.newAPI(univer)
}

function createUniverWithCollaboration(container, url) {

	const universerEndpoint = '';

    // check if the unit is already created
    const unitInfo = getUnitByURL(url)
    if (unitInfo) {
	  const {type,id} = unitInfo;
      Promise.all([
        fetch('https://unpkg.com/@univerjs-pro/collaboration-client/lib/locale/en-US.json').then(res => res.json()),
      ]).then(([
        collaborationLocale,
      ]) => {
        setup({
          ...collaborationLocale,
        },id, type);
      })
    }

    const setup = (extLocale, unitId, type) => {
      var {
        UniverCore,
        UniverDesign,
        UniverEngineRender,
        UniverEngineFormula,
        UniverDocs,
        UniverDocsUi,
        UniverUi,
        UniverSheets,
        UniverSheetsUi,
        UniverSheetsNumfmt,
        UniverCollaboration,
        UniverCollaborationClient,
        UniverSheetsThreadComment,
        UniverSheetsFormula: { UniverSheetsFormulaPlugin },
      } = window

	  const {SnapshotService} = UniverCollaboration;
	  console.info('SnapshotService:::', SnapshotService, unitId, type);

      var univer = new UniverCore.Univer({
        theme: UniverDesign.defaultTheme,
        locale: UniverCore.LocaleType.EN_US,
        locales: {
          [UniverCore.LocaleType.EN_US]: {
            ...UniverUMD['en-US'],
            ...extLocale
          },
        },
        override: [
          [UniverCore.IAuthzIoService, null],
          [UniverCore.IUndoRedoService, null]
        ]
      });
      univer.registerPlugin(UniverDocs.UniverDocsPlugin, {
        hasScroll: false,
      });

      univer.registerPlugin(UniverEngineRender.UniverRenderEnginePlugin);
      univer.registerPlugin(UniverEngineFormula.UniverFormulaEnginePlugin);
      univer.registerPlugin(UniverSheetsFormulaPlugin);

      univer.registerPlugin(UniverUi.UniverUIPlugin, {
        container,
      });

      univer.registerPlugin(UniverDocsUi.UniverDocsUIPlugin);

      univer.registerPlugin(UniverSheets.UniverSheetsPlugin);
      univer.registerPlugin(UniverSheetsUi.UniverSheetsUIPlugin);

      //   pro
      const injector = univer.__getInjector();
      const configService = injector.get(UniverCore.IConfigService);

      // debug via reverse proxy
      const { SNAPSHOT_SERVER_URL_KEY, COLLAB_SUBMIT_CHANGESET_URL_KEY, COLLAB_WEB_SOCKET_URL_KEY, AUTHZ_URL_KEY } = UniverCollaborationClient;

      // config collaboration endpoint
      configService.setConfig(AUTHZ_URL_KEY, `${universerEndpoint}/universer-api/authz`);
      configService.setConfig(SNAPSHOT_SERVER_URL_KEY, `${universerEndpoint}/universer-api/snapshot`);
      configService.setConfig(COLLAB_SUBMIT_CHANGESET_URL_KEY, `${universerEndpoint}/universer-api/comb`);
      configService.setConfig(COLLAB_WEB_SOCKET_URL_KEY, `wss://${universerEndpoint}universer-api/comb/connect`);

      // collaboration
      univer.registerPlugin(UniverCollaboration.UniverCollaborationPlugin);
      univer.registerPlugin(UniverCollaborationClient.UniverCollaborationClientPlugin,{
				enableAuthServer: true
			});

			univer.__getInjector().get(SnapshotService).loadSheet(unitId,0)

    }

}


function getUnitByURL(url) {
	// Define a regular expression to match URLs with univer.ai and univer.plus domain names
	const regex = /https:\/\/(?:[\w.-]+\.)?univer\.(ai|plus)\/unit\/(\d+)\/([a-zA-Z0-9_-]+)/;
	const match = url.match(regex);

	if (match) {
		const type = Number.parseInt(match[2], 10);
		const id = match[3];
		return { type, id };
	}

	return null;
}
