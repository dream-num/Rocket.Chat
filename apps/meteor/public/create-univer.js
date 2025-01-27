const customEventElement = document.createElement('div');

window.customEventElement = customEventElement;

customEventElement.addEventListener("createUniver", (e) => {
	// createUniver(e.detail.ref, e.detail.url);
	createUniverWithCollaboration(e.detail.ref, e.detail.url);
});


function createUniver(container, url) {

	const {
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

	  const univer = new UniverCore.Univer({
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
			header: true,
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


		const unitInfo = getUnitByURL(url)
		if (unitInfo) {
			const {type,id} = unitInfo;

			if(type === 1){
				univer.createUnit(UniverCore.UniverInstanceType.UNIVER_DOC, {})
			}else if(type === 2){
				univer.createUnit(UniverCore.UniverInstanceType.UNIVER_SHEET, {})
			}
		}
}

const host = window.location.host;
const isSecure = window.location.protocol === 'https:';
const httpProtocol = isSecure ? 'https' : 'http';
const wsProtocol = isSecure ? 'wss' : 'ws';

function createUniverWithCollaboration(container, url) {
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
				UniverSheetsNumfmt:{UniverSheetsNumfmtPlugin},
        UniverCollaboration,
        UniverCollaborationClient,
        UniverSheetsFormula: { UniverSheetsFormulaPlugin },
      } = window

	  const {SnapshotService} = UniverCollaboration;
		const {Tools} = UniverCore

      var univer = new UniverCore.Univer({
        theme: UniverDesign.defaultTheme,
        locale: UniverCore.LocaleType.EN_US,
        locales: {
          [UniverCore.LocaleType.EN_US]: Tools.deepMerge(
            UniverUMD['en-US'],
            extLocale
          ),
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
				header: false,
        footer: false,
      });


			univer.registerPlugin(UniverSheetsNumfmtPlugin);

      univer.registerPlugin(UniverDocsUi.UniverDocsUIPlugin);

      univer.registerPlugin(UniverSheets.UniverSheetsPlugin);
      univer.registerPlugin(UniverSheetsUi.UniverSheetsUIPlugin);

			registerRichFeatures(univer);

      //   pro
      const injector = univer.__getInjector();
      const configService = injector.get(UniverCore.IConfigService);

      // debug via reverse proxy
      const { SNAPSHOT_SERVER_URL_KEY, COLLAB_SUBMIT_CHANGESET_URL_KEY, COLLAB_WEB_SOCKET_URL_KEY, AUTHZ_URL_KEY } = UniverCollaborationClient;

      // config collaboration endpoint
      configService.setConfig(AUTHZ_URL_KEY, `${httpProtocol}://${host}/universer-api/authz`);
      configService.setConfig(SNAPSHOT_SERVER_URL_KEY, `${httpProtocol}://${host}/universer-api/snapshot`);
      configService.setConfig(COLLAB_SUBMIT_CHANGESET_URL_KEY, `${httpProtocol}://${host}/universer-api/comb`);
      configService.setConfig(COLLAB_WEB_SOCKET_URL_KEY, `${wsProtocol}://${host}/universer-api/comb/connect`);

      // collaboration
      univer.registerPlugin(UniverCollaboration.UniverCollaborationPlugin);
      univer.registerPlugin(UniverCollaborationClient.UniverCollaborationClientPlugin,{
				enableAuthServer: true
			});

			if(type === 1){
				univer.__getInjector().get(SnapshotService).loadDoc(unitId,0)
			}else if(type === 2){
				univer.__getInjector().get(SnapshotService).loadSheet(unitId,0)
			}
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


function registerRichFeatures(univer){
	const {
		UniverSheetsZenEditor: {UniverSheetsZenEditorPlugin},
		UniverSheetsFindReplace: {UniverSheetsFindReplacePlugin},
		UniverSheetsConditionalFormatting: {UniverSheetsConditionalFormattingPlugin},
		UniverDataValidation: {UniverDataValidationPlugin},
		UniverSheetsDataValidation: {UniverSheetsDataValidationPlugin},
		UniverSheetsFilter: {UniverSheetsFilterPlugin},
		UniverSheetsFilterUi: {UniverSheetsFilterUIPlugin},
		UniverDrawing: {UniverDrawingPlugin,IImageIoService},
		UniverDrawingUi: {UniverDrawingUIPlugin},
		UniverSheetsDrawing: {UniverSheetsDrawingPlugin},
		UniverSheetsDrawingUi: {UniverSheetsDrawingUIPlugin},
		UniverSheetsSort: {UniverSheetsSortPlugin},
		UniverSheetsSortUi: {UniverSheetsSortUIPlugin},
		UniverSheetsPivot: {UniverSheetsPivotTablePlugin},
		UniverSheetsPivotUi: {UniverSheetsPivotTableUIPlugin},
		UniverSheetsHyperLinkUi: {UniverSheetsHyperLinkUIPlugin},
	} = window;
	// zen editor
	univer.registerPlugin(UniverSheetsZenEditorPlugin);

	// find replace
	univer.registerPlugin(UniverSheetsFindReplacePlugin);

	// conditional formatting
	univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);

	// data validation
	univer.registerPlugin(UniverDataValidationPlugin);
	univer.registerPlugin(UniverSheetsDataValidationPlugin);

	// filter
	univer.registerPlugin(UniverSheetsFilterPlugin);
	univer.registerPlugin(UniverSheetsFilterUIPlugin);

	// drawing
	univer.registerPlugin(UniverDrawingPlugin, {
        override: [[IImageIoService, null]],
    });
	univer.registerPlugin(UniverDrawingUIPlugin);
    univer.registerPlugin(UniverSheetsDrawingPlugin);
    univer.registerPlugin(UniverSheetsDrawingUIPlugin);

	// sort
	univer.registerPlugin(UniverSheetsSortPlugin);
	univer.registerPlugin(UniverSheetsSortUIPlugin);

	// pivot table
	// univer.registerPlugin(UniverSheetsPivotTablePlugin,{
	// 	isServer: true,
	// });
	// univer.registerPlugin(UniverSheetsPivotTableUIPlugin);

	univer.registerPlugin(UniverSheetsHyperLinkUIPlugin);
}
